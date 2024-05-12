import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { PrismaService } from 'src/integrations/prisma/prisma.service';

@Injectable()
export class QuizService {
	constructor(private readonly prismaService: PrismaService) {}

	async create(createQuizDto: CreateQuizDto) {
		return await this.prismaService.quiz.create({
			data: {
				summary: createQuizDto.summary,
				title: createQuizDto.title,
				subtitle: createQuizDto.subtitle,
				media: createQuizDto.mediaId
					? { connect: { id: createQuizDto.mediaId } }
					: undefined,
				maxScore: this.getQuizMaxScore(createQuizDto) as number,
				questions: {
					create: createQuizDto.questions.map(question => ({
						...question,
						media: question.mediaId
							? { connect: { id: question.mediaId } }
							: undefined,
						answers: {
							create: question.answers.map(answer => ({
								...answer,
								score: answer.score || 0,
								media: answer.mediaId
									? { connect: { id: answer.mediaId } }
									: undefined
							}))
						}
					}))
				}
			},
			include: {
				questions: {
					include: { answers: { include: { media: true } }, media: true }
				},
				media: true
			}
		});
	}

	async findAll(page, pageSize) {
		const skip = (page - 1) * pageSize;
		const take = pageSize;
		return await this.prismaService.quiz.findMany({
			skip,
			take,
			include: {
				media: true,
				_count: {
					select: { questions: true }
				}
			}
		});
	}

	async findOne(id: number) {
		return await this.prismaService.quiz.findUnique({
			where: { id },
			include: {
				questions: {
					include: { answers: { include: { media: true } }, media: true }
				},
				media: true
			}
		});
	}

	async update(id: number, updateQuizDto: UpdateQuizDto) {
		try {
			const quizUpdatePromise = this.prismaService.quiz.update({
				where: { id: id },
				data: {
					mediaId: updateQuizDto.mediaId,
					summary: updateQuizDto.summary,
					title: updateQuizDto.title,
					subtitle: updateQuizDto.subtitle,
					maxScore: this.getQuizMaxScore(updateQuizDto),
					questions: {
						updateMany: updateQuizDto.questions.map(question => ({
							where: { id: question.id },
							data: {
								mediaId: question.mediaId,
								title: question.title,
								subtitle: question.subtitle
							}
						}))
					}
				},
				include: {
					questions: {
						include: {
							answers: true,
							media: true
						}
					},
					media: true
				}
			});

			const answersUpdatePromises = updateQuizDto.questions.flatMap(question =>
				question.answers.map(answer =>
					this.prismaService.quizAnswer.update({
						where: { id: answer.id },
						data: {
							title: answer.title,
							score: answer.score,
							mediaId: answer.mediaId
						}
					})
				)
			);

			// Execute all updates as a transaction
			await this.prismaService.$transaction([
				quizUpdatePromise,
				...answersUpdatePromises
			]);

			return quizUpdatePromise;
		} catch (error) {
			console.error(error);
			throw new NotFoundException('Quiz not found');
		}
	}

	async removeQuiz(id: number) {
		try {
			await this.prismaService.quiz.delete({ where: { id } });
		} catch (error) {
			throw new NotFoundException('Quiz not found');
		}
	}

	async removeAnswer(id: number) {
		try {
			await this.prismaService.quizAnswer.delete({ where: { id } });
		} catch (error) {
			throw new NotFoundException('Quiz question not found');
		}
	}

	getQuizMaxScore(quiz) {
		const maxScore = quiz.questions.reduce((totalScore, question) => {
			const maxAnswerScore = question.answers.reduce(
				(max, answer) => Math.max(max, answer.score),
				0
			);
			return totalScore + maxAnswerScore;
		}, 0) as number;

		return maxScore || 0;
	}
}
