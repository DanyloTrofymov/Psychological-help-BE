import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { Chatroom, ChatroomMessages, ChatroomParticipants } from '@prisma/client';
import { ROLES_KEY } from '../auth/guards/roles.guard';
import { ROLE } from 'src/data/types';

@Injectable()
export class UserService {
	constructor(private prismaService: PrismaService) {}

	async getTherapists() {
		return await this.prismaService.user.findMany({
			where: { role: { key: ROLE.THERAPIST } }
		});
	}
}
