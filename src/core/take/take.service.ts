import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTakeDto } from './dto/create-take.dto';
import { PrismaService } from 'src/integrations/prisma/prisma.service';

import { Prisma } from '@prisma/client';

@Injectable()
export class TakeService {
	constructor(private readonly prismaService: PrismaService) {}
	async create(createTakeDto: CreateTakeDto, userId: number) {
		const { quizId, answers } = createTakeDto;

		if (!Array.isArray(answers) || answers.length === 0) {
			throw new BadRequestException('Answers must be a non-empty array.');
		}

		const validAnswerIds = await this.prismaService.quizAnswer
			.findMany({
				where: { questionId: { in: answers.map(a => a.questionId) } },
				select: { id: true }
			})
			.then(answers => answers.map(a => a.id));

		if (!answers.every(a => validAnswerIds.includes(+a.answerId))) {
			throw new BadRequestException(
				'Invalid answer provided for one or more questions.'
			);
		}

		return await this.prismaService.$transaction(async tx => {
			const takeData: Prisma.TakeCreateInput = {
				quiz: { connect: { id: quizId } },
				user: { connect: { id: userId } },
				answers: {
					createMany: {
						data: answers.map(answer => ({
							questionId: answer.questionId,
							answerId: answer.answerId
						}))
					}
				}
			};

			const take = await tx.take.create({
				data: takeData,
				include: { answers: true }
			});

			return take;
		});
	}

	findAll() {
		return this.prismaService.take.findMany({
			include: { answers: true }
		});
	}

	findMy(id: number) {
		return this.prismaService.take.findMany({
			where: { userId: id },
			include: { answers: true }
		});
	}

	findOne(id: number) {
		return this.prismaService.take.findUnique({
			where: { id },
			include: { answers: true }
		});
	}
}
