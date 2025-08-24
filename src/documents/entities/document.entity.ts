import { ApiProperty } from '@nestjs/swagger';

export class Document {
  @ApiProperty({
    description: 'The unique identifier of the document',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'The title of the document',
    example: 'Project Requirements Document',
  })
  title: string;

  @ApiProperty({
    description: 'The URL of the document',
    example: 'https://docs.google.com/document/d/1234567890',
  })
  url: string;

  @ApiProperty({
    description: 'The ID of the section this document belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  sectionId: string;

  @ApiProperty({
    description: 'The date and time when the document was created',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The section this document belongs to',
    type: 'object',
    properties: {
      id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
      name: { type: 'string', example: 'Marketing Documents' },
    },
  })
  section?: {
    id: string;
    name: string;
  };
}
