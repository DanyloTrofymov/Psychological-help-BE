import { Test, TestingModule } from '@nestjs/testing';
import { HelpingCentersService } from './helping-centers.service';

describe('HelpingCentersService', () => {
	let service: HelpingCentersService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [HelpingCentersService]
		}).compile();

		service = module.get<HelpingCentersService>(HelpingCentersService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
