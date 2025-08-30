import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FormFieldType } from '@prisma/client';

export class CreateFormFieldDto {
  @ApiProperty({
    description: 'Field label displayed to users',
    example: 'Full Name',
    maxLength: 255,
  })
  @IsString({ message: 'Label must be a string' })
  @IsNotEmpty({ message: 'Label is required' })
  @MaxLength(255, { message: 'Label must not exceed 255 characters' })
  label: string;

  @ApiProperty({
    description: 'Type of form field',
    enum: FormFieldType,
    example: 'INPUT_TEXT',
  })
  @IsEnum(FormFieldType, { message: 'Invalid field type' })
  fieldType: FormFieldType;

  @ApiProperty({
    description: 'Whether this field is required',
    example: true,
  })
  @IsBoolean({ message: 'isRequired must be a boolean' })
  isRequired: boolean;

  @ApiPropertyOptional({
    description: 'Options for select/radio fields',
    type: [String],
    example: ['Option 1', 'Option 2', 'Option 3'],
  })
  @IsOptional()
  @IsArray({ message: 'Options must be an array' })
  @IsString({ each: true, message: 'Each option must be a string' })
  options?: string[];

  @ApiPropertyOptional({
    description: 'Validation rules for the field',
    example: { minLength: 2, maxLength: 100 },
  })
  @IsOptional()
  validation?: Record<string, any>;
}

export class CreateFormDto {
  @ApiProperty({
    description: 'Form title',
    example: 'Contact Form',
    maxLength: 255,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title: string;

  @ApiPropertyOptional({
    description: 'Form description',
    example: 'A simple contact form for customer inquiries',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Google Drive folder ID for file uploads',
    example: 'drive123abc',
  })
  @IsOptional()
  @IsString({ message: 'Drive ID must be a string' })
  driveId?: string;

  @ApiProperty({
    description: 'Form fields configuration',
    type: [CreateFormFieldDto],
  })
  @IsArray({ message: 'Fields must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateFormFieldDto)
  fields: CreateFormFieldDto[];
}

export class UpdateFormDto {
  @ApiPropertyOptional({
    description: 'Form title',
    example: 'Updated Contact Form',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Form description',
    example: 'An updated contact form with additional fields',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the form is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Google Drive folder ID for file uploads',
    example: 'drive123abc',
  })
  @IsOptional()
  @IsString({ message: 'Drive ID must be a string' })
  driveId?: string;

  @ApiPropertyOptional({
    description: 'Form fields configuration',
    type: [CreateFormFieldDto],
  })
  @IsOptional()
  @IsArray({ message: 'Fields must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateFormFieldDto)
  fields?: CreateFormFieldDto[];
}

export class FormFieldResponseDto {
  @ApiProperty({
    description: 'Field unique identifier',
    example: 'field123',
  })
  id: string;

  @ApiProperty({
    description: 'Field label',
    example: 'Full Name',
  })
  label: string;

  @ApiProperty({
    description: 'Field type',
    enum: FormFieldType,
    example: 'INPUT_TEXT',
  })
  fieldType: FormFieldType;

  @ApiProperty({
    description: 'Whether the field is required',
    example: true,
  })
  isRequired: boolean;

  @ApiPropertyOptional({
    description: 'Field options for select/radio fields',
    type: [String],
    example: ['Option 1', 'Option 2'],
  })
  options?: string[];

  @ApiPropertyOptional({
    description: 'Field validation rules',
    example: { minLength: 2, maxLength: 100 },
  })
  validation?: Record<string, any>;

  @ApiProperty({
    description: 'Field display order',
    example: 0,
  })
  order: number;
}

export class FormResponseDto {
  @ApiProperty({
    description: 'Form unique identifier',
    example: 'clp123abc456def789',
  })
  id: string;

  @ApiProperty({
    description: 'Form title',
    example: 'Contact Form',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Form description',
    example: 'A simple contact form',
  })
  description?: string;

  @ApiProperty({
    description: 'Whether the form is active',
    example: true,
  })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Google Drive folder ID',
    example: 'drive123abc',
  })
  driveId?: string;

  @ApiProperty({
    description: 'Form creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Form last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Form fields',
    type: [FormFieldResponseDto],
  })
  fields: FormFieldResponseDto[];
}

export class FormListResponseDto {
  @ApiProperty({
    description: 'Form unique identifier',
    example: 'clp123abc456def789',
  })
  id: string;

  @ApiProperty({
    description: 'Form title',
    example: 'Contact Form',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Form description',
    example: 'A simple contact form',
  })
  description?: string;

  @ApiProperty({
    description: 'Whether the form is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Form creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Form last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Form statistics',
    example: { submissions: 25 },
  })
  _count: {
    submissions: number;
  };
}
