import { Module, forwardRef } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { ChatroomGateway } from './gateway/chatroom.gateway';
import { ChatroomController } from './chatroom.controller';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';

@Module({
	controllers: [ChatroomController],
	providers: [ChatroomService, ChatroomGateway, UserService, AuthService],
	exports: [ChatroomService, ChatroomGateway]
})
export class ChatroomModule {}
