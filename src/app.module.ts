import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './core/auth/auth.controller';
import { AuthModule } from './core/auth/auth.module';
import { PrismaModule } from './integrations/prisma/prisma.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './core/auth/guards/auth.guard';
import { RolesGuard } from './core/auth/guards/roles.guard';
import { QuizController } from './core/quiz/quiz.controller';
import { QuizModule } from './core/quiz/quiz.module';
import { AllExceptionsFilter } from './exception.filter';
import { MediaModule } from './core/media/media.module';
import { TakeModule } from './core/take/take.module';
import { ChatroomController } from './core/chatroom/chatroom.controller';
import { ChatroomModule } from './core/chatroom/chatroom.module';
import { CommonProblemsModule } from './core/common-problems/common-problems.module';
import { HelpingCentersModule } from './core/helping-centers/helping-centers.module';

@Module({
	imports: [
		PrismaModule,
		AuthModule,
		QuizModule,
		MediaModule,
		TakeModule,
		ChatroomModule,
		CommonProblemsModule,
		HelpingCentersModule
	],
	controllers: [
		AppController,
		AuthController,
		QuizController,
		ChatroomController
	],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard
		},
		{
			provide: APP_FILTER,
			useClass: AllExceptionsFilter
		}
	]
})
export class AppModule {}
