import { Controller, Get, Post, Body, Param, Request, ParseIntPipe } from '@nestjs/common';
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
	findAll() {
		return this.takeService.findAll();
	}

	@Get('my')
	findMy(@Request() req) {
		return this.takeService.findMy(req.user.id);
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.takeService.findOne(id);
	}
}
