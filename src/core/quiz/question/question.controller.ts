import { Controller, Get, Param, Delete } from '@nestjs/common';
import { QuestionService } from './question.service';
import { Roles } from 'src/core/auth/guards/roles.guard';
import { ROLE } from 'src/data/types';

@Controller('quiz/question')
export class QuestionController {
	constructor(private readonly questionService: QuestionService) {}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.questionService.findOne(+id);
	}

	@Delete('/:id')
	@Roles(ROLE.ADMIN)
	removeQuestion(@Param('id') id: string) {
		return this.questionService.removeQuestion(+id);
	}
}
