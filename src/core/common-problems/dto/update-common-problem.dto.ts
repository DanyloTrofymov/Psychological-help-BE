import { PartialType } from '@nestjs/mapped-types';
import { CreateCommonProblemDto } from './create-common-problem.dto';

export class UpdateCommonProblemDto extends PartialType(
	CreateCommonProblemDto
) {}
