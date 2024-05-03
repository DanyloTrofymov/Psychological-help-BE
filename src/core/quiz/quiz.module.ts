import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { QuestionModule } from './question/question.module';
import { QuestionController } from './question/question.controller';

@Module({
	imports: [QuestionModule],
	controllers: [QuizController, QuestionController],
	providers: [QuizService],
	exports: [QuizService]
})
export class QuizModule {}
