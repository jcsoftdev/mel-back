import { IsString, IsNotEmpty, IsUUID, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'The title of the document',
    example: 'Project Requirements Document',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The URL of the document',
    example: 'https://docs.google.com/document/d/1234567890',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'The ID of the section this document belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID(4)
  @IsNotEmpty()
  sectionId: string;
}
