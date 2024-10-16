import { Module } from '@nestjs/common';
import { HelpingCentersService } from './helping-centers.service';
import { HelpingCentersController } from './helping-centers.controller';

@Module({
	controllers: [HelpingCentersController],
	providers: [HelpingCentersService]
})
export class HelpingCentersModule {}
