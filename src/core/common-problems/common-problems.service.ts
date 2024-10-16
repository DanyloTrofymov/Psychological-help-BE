import { Injectable } from '@nestjs/common';
import { CreateCommonProblemDto } from './dto/create-common-problem.dto';
import { UpdateCommonProblemDto } from './dto/update-common-problem.dto';
import { PrismaService } from 'src/integrations/prisma/prisma.service';

@Injectable()
export class CommonProblemsService {
	constructor(private readonly prismaService: PrismaService) {}

	async create(createCommonProblemDto: CreateCommonProblemDto) {
		return await this.prismaService.commonProblems.create({
			data: createCommonProblemDto
		});
	}

	async findAll() {
		return await this.prismaService.commonProblems.findMany();
	}

	async findOne(id: number) {
		return await this.prismaService.commonProblems.findUnique({
			where: { id }
		});
	}

	async update(id: number, updateCommonProblemDto: UpdateCommonProblemDto) {
		return await this.prismaService.commonProblems.update({
			where: { id },
			data: updateCommonProblemDto
		});
	}

	async remove(id: number) {
		return await this.prismaService.commonProblems.delete({ where: { id } });
	}
}
