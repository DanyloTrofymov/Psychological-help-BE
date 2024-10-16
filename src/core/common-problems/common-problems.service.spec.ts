import { Test, TestingModule } from '@nestjs/testing';
import { CommonProblemsService } from './common-problems.service';

describe('CommonProblemsService', () => {
	let service: CommonProblemsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [CommonProblemsService]
		}).compile();

		service = module.get<CommonProblemsService>(CommonProblemsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
