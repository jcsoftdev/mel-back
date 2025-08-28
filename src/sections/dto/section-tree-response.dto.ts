import { ApiProperty } from '@nestjs/swagger';

export class SectionTreeResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the section',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the section',
    example: 'Introduction',
  })
  name: string;

  @ApiProperty({
    description: 'The parent section ID if this is a subsection',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  parentId?: string;

  @ApiProperty({
    description: 'The date and time when the section was created',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Child sections (subsections) in a tree structure',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440002',
        },
        name: {
          type: 'string',
          example: 'Subsection 1',
        },
        parentId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        children: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/SectionTreeResponseDto',
          },
        },
        documents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '550e8400-e29b-41d4-a716-446655440003',
              },
              name: {
                type: 'string',
                example: 'Document 1',
              },
              sectionId: {
                type: 'string',
                example: '550e8400-e29b-41d4-a716-446655440000',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
        },
      },
    },
    required: false,
  })
  children?: SectionTreeResponseDto[];

  @ApiProperty({
    description: 'Documents within this section',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440003',
        },
        name: {
          type: 'string',
          example: 'Document 1',
        },
        sectionId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
      },
    },
    required: false,
  })
  documents?: {
    id: string;
    name: string;
    sectionId: string;
    createdAt: Date;
  }[];
}
