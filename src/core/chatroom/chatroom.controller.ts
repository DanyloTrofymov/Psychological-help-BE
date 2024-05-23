import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Request } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { Roles } from '../auth/guards/roles.guard';
import { ROLE } from 'src/data/types';

@Controller('chat')
export class ChatroomController {
	constructor(private readonly chatroomService: ChatroomService) {}

	@Roles([ROLE.ADMIN])
	@Get('')
	async getAllChats(@Request() req, @Query('page', ParseIntPipe) page: number = 0,
		@Query('pageSize', ParseIntPipe) pageSize: number = 10) {
		return await this.chatroomService.getAllChatrooms(page, pageSize);
	}

	@Get('aiChats')
	async getAiChats(@Request() req, @Query('page', ParseIntPipe) page: number = 0,
		@Query('pageSize', ParseIntPipe) pageSize: number = 10) {
		return await this.chatroomService.getAIChatrooms(req.user.id, page, pageSize);
	}

	@Get('usersChats')
	async getUsersChats(@Request() req, @Query('page', ParseIntPipe) page: number = 0,
		@Query('pageSize', ParseIntPipe) pageSize: number = 10) {
		return await this.chatroomService.getUsersChatrooms(req.user.id, page, pageSize);
	}

	@Roles([ROLE.ADMIN, ROLE.THERAPIST])
	@Get('withoutTherapis')
	async getWithoutTherapis(@Query('page', ParseIntPipe) page: number = 0,
		@Query('pageSize', ParseIntPipe) pageSize: number = 10) {
		return await this.chatroomService.getChatroomWithoutTherapist(page, pageSize);
	}

	@Roles([ROLE.ADMIN, ROLE.THERAPIST])
	@Post('joinRoom')
	async joinRoom(@Request() req, @Body() body: { chatroomId: number }) {
		return await this.chatroomService.joinChatroom(body.chatroomId, req.user.id, req.user.role);
	}

	@Post('pingAdmin')
	async pingAdmin(@Request() req, @Body() body: { chatroomId: number }) {
		return await this.chatroomService.pingAdmin(body.chatroomId, req.user.id);
	}

	@Get('messages')
	async getMessages(@Query('chatroomId', ParseIntPipe) chatroomId: number, @Query('page', ParseIntPipe) page: number = 0,
		@Query('pageSize', ParseIntPipe) pageSize: number = 10) {
		return await this.chatroomService.getMessagesByChatroomId(chatroomId, page, pageSize);
	}

	@Put(':id')
	async renameChatroom(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() body: { title: string }) {
		return await this.chatroomService.renameChatroom(id, body.title, req.user);
	}

	@Delete(':id')
	async deleteChatroom(@Request() req, @Param('id', ParseIntPipe) id: number) {
		return await this.chatroomService.deleteChatroom(id, req.user);
	}

	@Post('sendTakeToAi/:id')
	async sendTakeToAi(@Request() req, @Param('id', ParseIntPipe) takeId: number) {
		return await this.chatroomService.sendTakeToAi(takeId, req.user.id);
	}

	@Post('sendTakeToTherapist/:id')
	async sendTakeToTherapist(@Request() req, @Param('id', ParseIntPipe) takeId: number) {
		return await this.chatroomService.sendTakeToThearapist(takeId, req.user.id);
	}
}
