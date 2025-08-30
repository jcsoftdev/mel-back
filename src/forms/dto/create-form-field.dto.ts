import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEnum,
  IsObject,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FormFieldType } from '@prisma/client';

export class CreateFormFieldDto {
  @ApiProperty({
    description: 'Type of form field',
    enum: FormFieldType,
    example: FormFieldType.INPUT_TEXT,
  })
  @IsEnum(FormFieldType, { message: 'Invalid field type' })
  fieldType: FormFieldType;

  @ApiProperty({
    description: 'Field label displayed to users',
    example: 'Full Name',
    maxLength: 255,
  })
  @IsString({ message: 'Label must be a string' })
  @IsNotEmpty({ message: 'Label is required' })
  label: string;

  @ApiPropertyOptional({
    description: 'Placeholder text for input fields',
    example: 'Enter your full name',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Placeholder must be a string' })
  placeholder?: string;

  @ApiPropertyOptional({
    description: 'Whether the field is required',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isRequired must be a boolean' })
  isRequired?: boolean;

  @ApiProperty({
    description: 'Display order of the field',
    example: 0,
    minimum: 0,
  })
  @IsInt({ message: 'Order must be an integer' })
  @Min(0, { message: 'Order must be non-negative' })
  order: number;

  @ApiPropertyOptional({
    description: 'Field-specific options (e.g., select options)',
    example: ['Option 1', 'Option 2', 'Option 3'],
  })
  @IsOptional()
  @IsObject({ message: 'Options must be an object' })
  options?: any;

  @ApiPropertyOptional({
    description: 'Field validation rules',
    example: { minLength: 2, maxLength: 50 },
  })
  @IsOptional()
  @IsObject({ message: 'Validation must be an object' })
  validation?: any;
}
