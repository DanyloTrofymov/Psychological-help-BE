export class CreateTakeDto {
	quizId: number;
	answers: CreateTakeAnswerDto[];
}

export class CreateTakeAnswerDto {
	questionId: number;
	answerId: number;
}
