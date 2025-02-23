import { Injectable } from '@nestjs/common';
import { CreateHelpingCenterDto } from './dto/create-helping-center.dto';
import { UpdateHelpingCenterDto } from './dto/update-helping-center.dto';
import { PrismaService } from 'src/integrations/prisma/prisma.service';

@Injectable()
export class HelpingCentersService {
	constructor(private readonly prismaService: PrismaService) {}

	async create(createHelpingCenterDto: CreateHelpingCenterDto) {
		return await this.prismaService.helpingCenters.create({
			data: createHelpingCenterDto
		});
	}

	async findAll() {
		return await this.prismaService.helpingCenters.findMany();
	}

	async findOne(id: number) {
		return await this.prismaService.helpingCenters.findUnique({
			where: { id }
		});
	}

	async update(id: number, updateHelpingCenterDto: UpdateHelpingCenterDto) {
		return await this.prismaService.helpingCenters.update({
			where: { id },
			data: updateHelpingCenterDto
		});
	}

	async remove(id: number) {
		return await this.prismaService.helpingCenters.delete({ where: { id } });
	}
}
