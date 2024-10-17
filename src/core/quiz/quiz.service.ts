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

	async findAll(page: number, pageSize: number, userId: number) {
		const skip = page * pageSize;
		const take = pageSize;
		const totalElements = await this.prismaService.quiz.count(); // Get total number of quizzes
		const totalPages = Math.ceil(totalElements / pageSize);

		const quizzes = await this.prismaService.quiz.findMany({
			skip,
			take,
			include: {
				media: true,
				_count: {
					select: { questions: true, take: true } // Include the count of takes
				}
			}
		});

		let content;
		if (userId) {
			content = await Promise.all(
				quizzes.map(async quiz => {
					const userTakes = await this.prismaService.take.findMany({
						where: {
							quizId: quiz.id,
							userId: userId
						}
					});
					const lastTake = userTakes[userTakes.length - 1];

					return {
						...quiz,
						lastTakeId: lastTake?.id
					};
				})
			);
		} else {
			content = quizzes;
		}

		return {
			page,
			limit: pageSize,
			totalElements,
			totalPages,
			content
		};
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

	async getQuizStatistics(quizId: number) {
		const quiz = await this.prismaService.quiz.findUnique({
			where: { id: quizId }
		});
		const takes = await this.prismaService.take.findMany({
			where: { quizId },
			include: {
				answers: {
					include: {
						answer: true
					}
				}
			}
		});

		const totalScores = takes.map(take => {
			return take.answers.reduce((total, takeAnswer) => {
				return total + takeAnswer.answer.score;
			}, 0);
		});

		const binSize = 5;
		const scoreBins = Array(Math.ceil(quiz.maxScore / binSize))
			.fill(0)
			.map((_, i) => ({
				scoreMin: i * binSize,
				scoreMax: (i + 1) * binSize - 1,
				count: 0
			}));

		totalScores.forEach(score => {
			const binIndex = Math.floor(score / binSize);
			scoreBins[binIndex].count += 1;
		});

		const questions = await this.prismaService.quizQuestion.findMany({
			where: { quizId },
			include: {
				answers: {
					include: {
						takeAnswer: true
					}
				}
			}
		});

		const answerCounts = questions.map(question => {
			const answerCountMap = question.answers.map(answer => ({
				answerId: answer.id,
				answerTitle: answer.title,
				count: answer.takeAnswer.length
			}));

			return {
				questionId: question.id,
				questionTitle: question.title,
				counts: answerCountMap
			};
		});

		return {
			quizTitle: quiz.title,
			scoreBins,
			answerCounts
		};
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

	async findUniqueQuizzesParticipatedByUser(
		page: number = 0,
		pageSize: number = 10,
		userId: number
	) {
		try {
			const userTakes = await this.prismaService.take.findMany({
				where: { userId },
				select: { quizId: true }
			});

			const uniqueQuizIds = [...new Set(userTakes.map(take => take.quizId))];

			const totalElements = uniqueQuizIds.length;
			const totalPages = Math.ceil(totalElements / pageSize);
			const skip = page * pageSize;
			const take = pageSize;

			const quizzes = await this.prismaService.quiz.findMany({
				where: { id: { in: uniqueQuizIds } },
				skip,
				take
			});

			return {
				page,
				limit: pageSize,
				totalElements,
				totalPages,
				content: quizzes
			};
		} catch (error) {
			console.error(error);
			throw new NotFoundException('No quizzes found for the user');
		}
	}
}
