import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { Chatroom, ChatroomMessages, ChatroomParticipants, Role } from '@prisma/client';
import { ROLE } from 'src/data/types';
import { CurrentUserResponse } from '../auth/dto/auth.response';
import { ChatroomGateway } from './gateway/chatroom.gateway';
import OpenAI from 'openai';

@Injectable()
export class ChatroomService {
	private openai: OpenAI
	constructor(private prismaService: PrismaService) {
		this.openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});
	}

	async createChatroomAI(title: string, userId: number, aiThreadId: string, withAI?: boolean): Promise<Chatroom> {
		return await this.prismaService.chatroom.create({
			data: {
				title, ChatroomParticipants: { create: { userId, aiThreadId } }, withAI
			}
		});
	}

	async createChatroomUsers(title: string, userId: number): Promise<Chatroom> {
		return await this.prismaService.chatroom.create({
			data: {
				title, ChatroomParticipants: { create: { userId } }
			}
		});
	}

	async getChatroom(id: number) {
		return await this.prismaService.chatroom.findUnique({
			where: { id },
			include: {
				ChatroomParticipants: true,
				ChatroomMessages: true,
			},
		});
	}

	async getChatroomWithoutTherapist(page: number, pageSize: number) {
		const chatrooms = await this.prismaService.chatroom.findMany({
			include: {
				ChatroomParticipants: true,
			},
			where: { active: true },
			take: pageSize,
			skip: page * pageSize,
			orderBy: { updatedAt: 'desc' }
		});

		return await chatrooms.filter(chatroom => chatroom.ChatroomParticipants.length === 1 && !chatroom.withAI);
	}

	async joinChatroom(chatroomId: number, userId: number, role?: ROLE) {
		const room = await this.prismaService.chatroom.findUnique({ where: { id: chatroomId }, include: { ChatroomParticipants: true } });
		if (!room) {
			throw new Error('Chatroom not found');
		}
		if (room.ChatroomParticipants.some(p => p.userId == userId)) {
			throw new Error('You are already a participant in this chatroom');
		}
		if (role == ROLE.THERAPIST && (room.withAI || room.ChatroomParticipants.length > 1)) {
			throw new Error('You can not join this chatroom as a therapist');
		}

		return await this.prismaService.chatroomParticipants.create({
			data: { chatroomId, userId }
		});
	}

	async pingAdmin(chatroomId: number, userId: number) {
		await this.addUserMessage(chatroomId, userId, 'Запит на підключення адміністратора відправлено');
		const admins = await this.prismaService.user.findMany({ where: { role: { key: ROLE.ADMIN } } });
		return this.prismaService.chatroomParticipants.createMany({
			data: admins.map(admin => ({ chatroomId, userId: admin.id })),
		});
	}

	async getChatroomsByUserId(id: number) {
		return await this.prismaService.chatroom.findMany({
			where: { ChatroomParticipants: { some: { userId: id } } },
			include: {
				ChatroomParticipants: true,
				ChatroomMessages: true,
			},
		});
	}

	async addUserMessage(chatroomId: number, userId: number, message: string): Promise<ChatroomMessages> {
		return await this.prismaService.chatroomMessages.create({
			data: {
				chatroomId,
				message,
				userId,
			},
		});
	}

	async addAIMessage(chatroomId: number, aiThreadId: string, message: string): Promise<ChatroomMessages> {
		return await this.prismaService.chatroomMessages.create({
			data: {
				chatroomId,
				message,
				aiThreadId,
			},
		});
	}

	async getChatroomMessages(chatroomId: number) {
		return await this.prismaService.chatroomMessages.findMany({
			where: { chatroomId },
			include: { user: true },
		});
	}

	async getAllChatrooms(page: number, pageSize: number) {
		return await this.prismaService.chatroom.findMany({
			include: { ChatroomParticipants: true },
			take: pageSize,
			skip: page * pageSize,
			orderBy: { updatedAt: 'desc' }
		});
	}

	async getAIChatrooms(userId: number, page: number, pageSize: number) {
		return await this.prismaService.chatroom.findMany({
			where: { ChatroomParticipants: { some: { userId } }, withAI: true, active: true },
			include: { ChatroomParticipants: true },
			take: pageSize,
			skip: page * pageSize,
			orderBy: { updatedAt: 'desc' }
		});
	}

	async getUsersChatrooms(userId: number, page: number, pageSize: number) {
		return await this.prismaService.chatroom.findMany({
			where: { ChatroomParticipants: { some: { userId } }, withAI: false, active: true }, take: pageSize,
			include: { ChatroomParticipants: true },
			skip: page * pageSize,
			orderBy: { updatedAt: 'desc' }
		});
	}

	async getMessagesByChatroomId(chatroomId: number, page: number, pageSize: number) {
		return await this.prismaService.chatroomMessages.findMany({
			where: { chatroomId: chatroomId },
			include: { user: { include: { avatar: true } } },
			take: pageSize,
			skip: page * pageSize,
			orderBy: { updatedAt: 'desc' }
		});
	}

	async renameChatroom(chatroomId: number, title: string, user: CurrentUserResponse) {
		const chatroom = await this.prismaService.chatroom.findUnique({ where: { id: chatroomId }, include: { ChatroomParticipants: true } });
		if (!chatroom) {
			throw new Error('Chatroom not found');
		}
		if (!chatroom.ChatroomParticipants.some(p => p.userId == user.id) && user.role.key !== ROLE.ADMIN) {
			throw new Error('You are not a participant in this chatroom');
		}
		return await this.prismaService.chatroom.update({
			where: { id: chatroomId },
			data: { title }
		});
	}

	async deleteChatroom(chatroomId: number, user: CurrentUserResponse) {
		const chatroom = await this.prismaService.chatroom.findUnique({ where: { id: chatroomId }, include: { ChatroomParticipants: true } });
		if (!chatroom) {
			throw new Error('Chatroom not found');
		}
		if (!chatroom.ChatroomParticipants.some(p => p.userId == user.id) && user.role.key !== ROLE.ADMIN) {
			throw new Error('You are not a participant in this chatroom');
		}
		return await this.prismaService.chatroom.update({
			where: { id: chatroomId },
			data: { active: false }
		});
	}

	async sendTakeToThearapist(takeId: number, userId: number) {
		const message = await this.getResultString(takeId);
		const chatroom = await this.createChatroomUsers('Чат з терапевтом', userId)
		// map question, answer and score
		await this.addUserMessage(chatroom.id, userId, message);
		return chatroom;
	}

	async sendTakeToAi(takeId: number, userId: number) {

		const message = await this.getResultString(takeId);

		const thread = await this.openai.beta.threads.create()
		const AImessage = await this.openai.beta.threads.messages.create(thread.id, { role: 'user', content: message });

		const AIchatroom = await this.createChatroomAI('Асистент', userId, thread.id, true);

		await this.addUserMessage(AIchatroom.id, userId, message);
		let fullMessge = ''
		const stream = await this.openai.beta.threads.runs
			.stream(AImessage.thread_id, {
				assistant_id: process.env.OPENAI_ASSISTANT_ID
			}).on('textDelta', (textDelta) => {
				fullMessge += textDelta?.value || '';
			})

		await stream.finalMessages();

		await this.addAIMessage(AIchatroom.id, AImessage.thread_id, fullMessge);

		return AIchatroom;
	}

	async getResultString(takeId: number) {
		const take = await this.prismaService.take.findUnique({ where: { id: (takeId) }, include: { answers: true, quiz: { include: { questions: { include: { answers: true } } } } } });
		const answers = take.answers.map(answer => {
			const question = take.quiz.questions.find(q => q.id === answer.questionId);
			return { question, answer, score: question.answers.find(a => a.id === answer.answerId).score };
		});
		const answersString = answers.map(a => `${a.question.title} - ${a.answer.answerId} - ${a.score} балів`).join('\n');
		const sumOfScores = answers.reduce((acc, a) => acc + a.score, 0);
		const message = `Привіт! Я пройшов тест ${take.quiz.title}. Проаналізуй мої відповіді і дай поради. Ось мої відповіді у форматі: Запитання - відповідь - бали. ${answersString}\n Результати тесту: ${sumOfScores} балів. Опис результату: ${take.quiz.summary}`;
		return message;
	}

}

