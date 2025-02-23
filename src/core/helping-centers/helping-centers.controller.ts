import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete
} from '@nestjs/common';
import { HelpingCentersService } from './helping-centers.service';
import { CreateHelpingCenterDto } from './dto/create-helping-center.dto';
import { UpdateHelpingCenterDto } from './dto/update-helping-center.dto';
import { Roles } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('helping-centers')
export class HelpingCentersController {
	constructor(private readonly helpingCentersService: HelpingCentersService) {}

	@Post()
	@Roles('ADMIN')
	create(@Body() createHelpingCenterDto: CreateHelpingCenterDto) {
		return this.helpingCentersService.create(createHelpingCenterDto);
	}

	@Get()
	@Public()
	findAll() {
		return this.helpingCentersService.findAll();
	}

	@Get(':id')
	@Public()
	findOne(@Param('id') id: string) {
		return this.helpingCentersService.findOne(+id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateHelpingCenterDto: UpdateHelpingCenterDto
	) {
		return this.helpingCentersService.update(+id, updateHelpingCenterDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.helpingCentersService.remove(+id);
	}
}
