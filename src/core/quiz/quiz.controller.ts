import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	ParseIntPipe,
	Request
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
		@Request() req,
		@Query('page', ParseIntPipe) page: number = 0,
		@Query('pageSize', ParseIntPipe) pageSize: number = 10
	) {
		console.log(req?.user?.id);
		return this.quizService.findAll(page, pageSize, req?.user?.id);
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.quizService.findOne(id);
	}

	@Patch(':id')
	@Roles(ROLE.ADMIN)
	update(@Param('id', ParseIntPipe) id: number, @Body() updateQuizDto: UpdateQuizDto) {
		return this.quizService.update(id, updateQuizDto);
	}

	@Delete(':id')
	@Roles(ROLE.ADMIN)
	removeQuiz(@Param('id', ParseIntPipe) id: number) {
		return this.quizService.removeQuiz(id);
	}

	@Delete('/answer/:id')
	@Roles(ROLE.ADMIN)
	removeAnswer(@Param('id', ParseIntPipe) id: number) {
		return this.quizService.removeAnswer(id);
	}

	@Get('statistics/:id')
	@Roles(ROLE.ADMIN)
	getStatistics(@Param('id', ParseIntPipe) id: number) {
		return this.quizService.getQuizStatistics(id);
	}
}
