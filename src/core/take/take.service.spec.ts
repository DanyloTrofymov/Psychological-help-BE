import { Test, TestingModule } from '@nestjs/testing';
import { TakeService } from './take.service';

describe('TakeService', () => {
	let service: TakeService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [TakeService]
		}).compile();

		service = module.get<TakeService>(TakeService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
