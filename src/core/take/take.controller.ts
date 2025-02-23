import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Request,
	ParseIntPipe,
	Query
} from '@nestjs/common';
import { TakeService } from './take.service';
import { CreateTakeDto } from './dto/create-take.dto';
import { Roles } from '../auth/guards/roles.guard';
import { ROLE } from 'src/data/types';

@Controller('take')
export class TakeController {
	constructor(private readonly takeService: TakeService) {}

	@Post()
	create(@Body() createTakeDto: CreateTakeDto, @Request() req) {
		return this.takeService.create(createTakeDto, req.user.id);
	}

	@Roles(ROLE.ADMIN)
	@Get()
	findAll(
		@Query('page', ParseIntPipe) page: number = 0,
		@Query('pageSize', ParseIntPipe) pageSize: number = 10
	) {
		return this.takeService.findAll(page, pageSize);
	}

	@Get('my')
	findMy(
		@Request() req,
		@Query('page', ParseIntPipe) page: number = 0,
		@Query('pageSize', ParseIntPipe) pageSize: number = 10
	) {
		return this.takeService.findMy(req.user.id, page, pageSize);
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.takeService.findOne(id);
	}

	@Get('/quiz/:quizId/latest')
	async findLatestUserTakeForQuiz(
		@Request() req,
		@Param('quizId', ParseIntPipe) quizId: number
	) {
		return this.takeService.findLatestUserTakeForQuiz(req?.user?.id, quizId);
	}
}
