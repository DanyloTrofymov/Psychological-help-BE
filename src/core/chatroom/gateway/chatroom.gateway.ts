import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketServer,
	MessageBody,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Namespace } from 'socket.io';
import { ChatroomService } from '../chatroom.service';
import { AuthService } from '../../auth/auth.service';
import { UserService } from 'src/core/user/user.service';
import OpenAI from 'openai';
import { Logger } from '@nestjs/common';
import { JwtPayload, verify } from 'jsonwebtoken';

@WebSocketGateway({
	namespace: '/chat',
	cors: {
		origin: (origin, cb) => {
			if (origin == undefined || origin.includes(process.env.BASE_URL)) {
				cb(null, true);
			} else {
				cb(new Error('Not allowed'), false);
			}
		},
		methods: ['GET', 'POST'],
		allowedHeaders: ['Authorization'],
		credentials: true,
	},
})
export class ChatroomGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private openai: OpenAI;
	private readonly logger = new Logger(AuthService.name);

	connectedUsers = [];

	constructor(
		private readonly chatroomService: ChatroomService,
		private readonly userService: UserService,

	) {
		this.openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});
	}
	@WebSocketServer()
	namespace: Namespace;


	afterInit(namespace: Namespace) {
		this.logger.log('WebSocket server initialized');
	}


	async handleConnection(client: Socket, ...args: any[]) {
		const token = client.handshake.auth.token;
		if (token) {
			await this.handleAuth(client, token);
			this.connectedUsers.push({ userId: client.data.userId, clientId: client.id });
			client.setMaxListeners(0);

			this.logger.log(`Client connected: ${client.data.userId}`);
		} else {
			this.logger.error('No token provided');
			client.disconnect();
		}
	}

	handleDisconnect(client: Socket) {
		client.rooms.forEach(room =>
			client.to(room).emit('disconnected', client.data.userId)
		)
		this.connectedUsers = this.connectedUsers.filter(u => u.userId !== client.data.userId);
		this.logger.log(`Client disconnected: ${client.data.userId}`);
	}

	async handleAuth(client: Socket, token: string) {
		try {
			const payload = verify(token, process.env.JWT_SECRET)
			client.data.userId = (payload as JwtPayload).id
		} catch (error) {
			client.disconnect();
		}
	}

	@SubscribeMessage('createChatroom')
	async handleJoinChatroom(@ConnectedSocket() client) {
		this.logger.log(`Client ${client.data.userId} created chatroom`);
		const chatroom = await this.chatroomService.createChatroomUsers('Чат з терапевтом', client.data.userId);
		client.emit('chatroomDetails', chatroom);
		const therapists = await this.userService.getTherapists();
		//const available = therapists.filter(t => !this.server.sockets.adapter.rooms.get(t.id.toString()));
		//available.forEach(t => client.to(t.id.toString()).emit('pingTherapists', chatroom));
	}

	@SubscribeMessage('sendUserMessage')
	async handleMessage(
		@MessageBody() data: { message: string, chatroomId: number },
		@ConnectedSocket() client: Socket,
	) {
		const userId = client.data.userId;
		const newMessage = await this.chatroomService.addUserMessage(
			data.chatroomId,
			userId,
			data.message,
		);

		const chatroomMembers = await this.chatroomService.getChatroom(data.chatroomId);

		const ids = chatroomMembers.ChatroomParticipants.map(p => p.userId).filter(id => userId !== id)
		const sockets = this.connectedUsers.filter(u => ids.includes(u.userId)).map(u => u.clientId);
		for (const socket of sockets) {
			this.namespace.to(socket).emit('newMessage', newMessage);
		}
		this.logger.log(`Message from ${userId} to chatroom ${data.chatroomId}: ${data.message}`);
	}

	@SubscribeMessage('AICreateChatroom')
	async handleStartChat(client: Socket) {
		const thread = await this.openai.beta.threads.create()
		const chatroom = await this.chatroomService.createChatroomAI('Асистент', client.data.userId, thread.id, true);
		await this.runAssistantStream(client, thread.id, chatroom.id);
		client.emit('chatroomDetails', chatroom);
	}

	@SubscribeMessage('sendAiMessage')
	async handleMessageChat(@MessageBody() data: { message: string, chatroomId: number },
		@ConnectedSocket() client: Socket) {
		const chatroom = await this.chatroomService.getChatroom(data.chatroomId);
		const threadId = chatroom.ChatroomParticipants.find(p => !!p.aiThreadId)?.aiThreadId;
		const thread = await this.openai.beta.threads.messages.create(threadId, { role: 'user', content: data.message });
		await this.chatroomService.addUserMessage(data.chatroomId, client.data.userId, data.message);
		await this.runAssistantStream(client, thread.thread_id, chatroom.id);
	}

	async runAssistantStream(client: Socket, threadId: string, chatId: number) {
		let fullMessge = ''
		const stream = await this.openai.beta.threads.runs
			.stream(threadId, {
				assistant_id: process.env.OPENAI_ASSISTANT_ID
			}).on('textDelta', (textDelta) => {
				client.emit('aiPartMessage', { chatroomId: chatId, message: textDelta?.value } || '');
				fullMessge += textDelta?.value || '';
			})
			.on('end', async () => {
				const message = await this.chatroomService.addAIMessage(chatId, threadId, fullMessge);
				client.emit('aiEndMessage', message);
			})
			.on('error', async () => {
				const message = await this.chatroomService.addAIMessage(chatId, threadId, fullMessge);
				client.emit('aiEndMessage', message);
			});

		await stream.finalMessages();
	}

	async createAiMessageAndFinishChat(chatId: number, threadId: string, client: Socket, fullMessge: string) {
		const message = await this.chatroomService.addAIMessage(chatId, threadId, fullMessge);
		client.emit('aiEndMessage', message);
	}
}
