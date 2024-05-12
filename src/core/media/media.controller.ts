import {
	Controller,
	Get,
	Post,
	Param,
	Delete,
	UseInterceptors,
	UploadedFile
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
	findOne(@Param('id') id: string) {
		return this.mediaService.findOne(+id);
	}
	@Delete(':id')
	@Roles('ADMIN')
	remove(@Param('id') id: string) {
		return this.mediaService.remove(+id);
	}
}
