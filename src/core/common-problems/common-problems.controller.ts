import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete
} from '@nestjs/common';
import { CommonProblemsService } from './common-problems.service';
import { CreateCommonProblemDto } from './dto/create-common-problem.dto';
import { UpdateCommonProblemDto } from './dto/update-common-problem.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/guards/roles.guard';

@Controller('common-problems')
export class CommonProblemsController {
	constructor(private readonly commonProblemsService: CommonProblemsService) {}

	@Post()
	@Roles('ADMIN')
	create(@Body() createCommonProblemDto: CreateCommonProblemDto) {
		return this.commonProblemsService.create(createCommonProblemDto);
	}

	@Get()
	@Public()
	findAll() {
		return this.commonProblemsService.findAll();
	}

	@Get(':id')
	@Public()
	findOne(@Param('id') id: string) {
		return this.commonProblemsService.findOne(+id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateCommonProblemDto: UpdateCommonProblemDto
	) {
		return this.commonProblemsService.update(+id, updateCommonProblemDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.commonProblemsService.remove(+id);
	}
}
