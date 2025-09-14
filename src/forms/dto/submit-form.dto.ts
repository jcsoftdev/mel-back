import {
  IsString,
  IsOptional,
  IsArray,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitFormFieldDto {
  @ApiProperty({
    description: 'Form field identifier',
    example: 'field123',
  })
  @IsString({ message: 'Field ID must be a string' })
  @IsNotEmpty({ message: 'Field ID is required' })
  fieldId: string;

  @ApiPropertyOptional({
    description: 'Field value submitted by user',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString({ message: 'Value must be a string' })
  value?: string;
}

export class SubmitFormDto {
  @ApiProperty({
    description: 'Form identifier',
    example: 'fa99b0e8-09f6-4d8b-91b2-a734c727ccdd',
  })
  @IsString({ message: 'Form ID must be a string' })
  @IsNotEmpty({ message: 'Form ID is required' })
  formId: string;

  @ApiProperty({
    description: 'Form field submissions',
    type: [SubmitFormFieldDto],
    example: [
      { fieldId: '09ae449b-3055-4546-bd6d-a74f3839bc76', value: 'John Doe' },
    ],
  })
  @IsArray({ message: 'Fields must be an array' })
  @ValidateNested({ each: true })
  @Transform(({ value }) => {
    console.log(value);
    // If fields are sent as a JSON string (multipart/form-data), parse them.
    if (typeof value === 'string') {
      try {
        const parsed: unknown = JSON.parse(value);
        return parsed as SubmitFormFieldDto[];
      } catch {
        // leave as-is so validation will catch it and produce a helpful error
        return value as unknown;
      }
    }
    return value as unknown;
  })
  @Type(() => SubmitFormFieldDto)
  fields: SubmitFormFieldDto[];

  @ApiPropertyOptional({
    description: 'Client IP address (automatically captured)',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString({ message: 'IP address must be a string' })
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'Client user agent (automatically captured)',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  @IsOptional()
  @IsString({ message: 'User agent must be a string' })
  userAgent?: string;
}
