import { Test, TestingModule } from '@nestjs/testing';
import { TakeController } from './take.controller';
import { TakeService } from './take.service';

describe('TakeController', () => {
	let controller: TakeController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [TakeController],
			providers: [TakeService]
		}).compile();

		controller = module.get<TakeController>(TakeController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
