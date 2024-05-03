export class UpdateQuizDto {
	id: number;
	title: string;
	summary?: string;
	subtitle?: string;
	mediaId?: number;
	questions: UpdateQuizQuestionDto[];
}

export class UpdateQuizAnswerDto {
	id: number;
	title: string;
	score: number;
	mediaId?: number;
}

export class UpdateQuizQuestionDto {
	id: number;
	title: string;
	subtitle?: string;
	type: string;
	mediaId?: number;
	answers: UpdateQuizAnswerDto[];
}
