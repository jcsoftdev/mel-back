import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({
    description: 'The name of the section',
    example: 'Marketing Documents',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'The ID of the parent section (for nested sections)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4)
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Google Drive folder ID for synchronization',
    example: '1l8QTyWaaGiYgoSqRYP17WxPa5NBX_1d_',
  })
  @IsOptional()
  @IsString()
  driveId?: string;
}
