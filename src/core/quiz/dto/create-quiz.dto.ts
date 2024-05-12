export class CreateQuizDto {
	title: string;
	summary?: string;
	subtitle?: string;
	mediaId?: number;
	questions: CreateQuizQuestionDto[];
}

export class CreateQuizQuestionDto {
	title: string;
	subtitle?: string;
	mediaId?: number;
	answers: CreateQuizAnswerDto[];
}

export class CreateQuizAnswerDto {
	title: string;
	score: number;
	mediaId?: number;
}
