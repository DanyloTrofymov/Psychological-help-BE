export class CreateQuizQuestionDto {
	title: string;
	subtitle?: string;
	type: string;
	mediaId?: number;
	answers: CreateQuizAnswerDto[];
}

export class CreateQuizDto {
	title: string;
	summary?: string;
	subtitle?: string;
	mediaId?: number;
	questions: CreateQuizQuestionDto[];
}

export class CreateQuizAnswerDto {
	title: string;
	score: number;
	mediaId?: number;
}
