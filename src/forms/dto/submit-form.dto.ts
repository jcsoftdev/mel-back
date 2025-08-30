import { IsString, IsOptional, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitFormDto {
  @ApiProperty({
    description: 'Form identifier',
    example: 'clp123abc456def789',
  })
  @IsString({ message: 'Form ID must be a string' })
  @IsNotEmpty({ message: 'Form ID is required' })
  formId: string;

  @ApiProperty({
    description: 'Form field values as key-value pairs',
    example: {
      field123: 'John Doe',
      field456: 'john@example.com',
      field789: '25',
    },
  })
  @IsObject({ message: 'Fields must be an object' })
  fields: Record<string, any>;

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
