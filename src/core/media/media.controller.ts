import {
	Controller,
	Get,
	Post,
	Param,
	Delete,
	UseInterceptors,
	UploadedFile,
	ParseIntPipe
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/guards/roles.guard';

@Controller('media')
export class MediaController {
	constructor(private readonly mediaService: MediaService) {}

	@Post()
	@UseInterceptors(FileInterceptor('file'))
	create(@UploadedFile() file: Express.Multer.File) {
		return this.mediaService.create(file);
	}

	@Get(':id')
	@Public()
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.mediaService.findOne(id);
	}
	@Delete(':id')
	@Roles('ADMIN')
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.mediaService.remove(id);
	}
}
