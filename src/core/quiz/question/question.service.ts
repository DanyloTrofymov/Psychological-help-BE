import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma/prisma.service';

@Injectable()
export class QuestionService {
	constructor(private readonly prismaService: PrismaService) {}

	async findOne(id: number) {
		return await this.prismaService.quizQuestion.findUnique({
			where: { id },
			include: { answers: true }
		});
	}

	async removeQuestion(id: number) {
		try {
			await this.prismaService.quizQuestion.delete({ where: { id } });
		} catch (error) {
			throw new NotFoundException('Qustion not found');
		}
	}
}
