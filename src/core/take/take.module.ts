import { Module } from '@nestjs/common';
import { TakeService } from './take.service';
import { TakeController } from './take.controller';

@Module({
	controllers: [TakeController],
	providers: [TakeService]
})
export class TakeModule { }
