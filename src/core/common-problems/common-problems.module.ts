import { Module } from '@nestjs/common';
import { CommonProblemsService } from './common-problems.service';
import { CommonProblemsController } from './common-problems.controller';

@Module({
	controllers: [CommonProblemsController],
	providers: [CommonProblemsService]
})
export class CommonProblemsModule {}
