import { PartialType } from '@nestjs/swagger';
import { CreateSectionDto } from './create-section.dto';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSectionDto extends PartialType(CreateSectionDto) {
  @ApiPropertyOptional({
    description: 'The updated name of the section',
    example: 'Updated Marketing Documents',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    description: 'The updated parent section ID (for moving sections)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4)
  parentId?: string;
}
