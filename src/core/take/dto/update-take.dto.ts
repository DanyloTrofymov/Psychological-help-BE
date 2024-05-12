import { PartialType } from '@nestjs/mapped-types';
import { CreateTakeDto } from './create-take.dto';

export class UpdateTakeDto extends PartialType(CreateTakeDto) {}
