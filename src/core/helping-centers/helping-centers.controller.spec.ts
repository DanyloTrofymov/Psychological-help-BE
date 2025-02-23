import { Test, TestingModule } from '@nestjs/testing';
import { HelpingCentersController } from './helping-centers.controller';
import { HelpingCentersService } from './helping-centers.service';

describe('HelpingCentersController', () => {
	let controller: HelpingCentersController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [HelpingCentersController],
			providers: [HelpingCentersService]
		}).compile();

		controller = module.get<HelpingCentersController>(HelpingCentersController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
