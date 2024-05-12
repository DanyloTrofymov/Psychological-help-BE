import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Roles } from '../auth/guards/roles.guard';
import { ROLE } from '../../data/types';
import { Public } from '../auth/decorators/public.decorator';
@Controller('quiz')
export class QuizController {
	constructor(private readonly quizService: QuizService) {}

	@Post()
	@Roles(ROLE.ADMIN)
	create(@Body() createQuizDto: CreateQuizDto) {
		return this.quizService.create(createQuizDto);
	}

	@Get()
	@Public()
	findAll(
		@Query('page') page: number = 1,
		@Query('pageSize') pageSize: number = 10
	) {
		return this.quizService.findAll(page, pageSize);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.quizService.findOne(+id);
	}

	@Patch(':id')
	@Roles(ROLE.ADMIN)
	update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
		return this.quizService.update(+id, updateQuizDto);
	}

	@Delete(':id')
	@Roles(ROLE.ADMIN)
	removeQuiz(@Param('id') id: string) {
		return this.quizService.removeQuiz(+id);
	}

	@Delete('/answer/:id')
	@Roles(ROLE.ADMIN)
	removeAnswer(@Param('id') id: string) {
		return this.quizService.removeAnswer(+id);
	}
}