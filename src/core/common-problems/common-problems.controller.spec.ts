import { Test, TestingModule } from '@nestjs/testing';
import { CommonProblemsController } from './common-problems.controller';
import { CommonProblemsService } from './common-problems.service';

describe('CommonProblemsController', () => {
	let controller: CommonProblemsController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [CommonProblemsController],
			providers: [CommonProblemsService]
		}).compile();

		controller = module.get<CommonProblemsController>(CommonProblemsController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
