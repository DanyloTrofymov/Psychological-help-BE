import { PartialType } from '@nestjs/mapped-types';
import { CreateHelpingCenterDto } from './create-helping-center.dto';

export class UpdateHelpingCenterDto extends PartialType(
	CreateHelpingCenterDto
) {}
