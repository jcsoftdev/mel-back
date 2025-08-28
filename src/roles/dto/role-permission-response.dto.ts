import { ApiProperty } from '@nestjs/swagger';

export class SectionPermissionResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the section access record',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'The role ID that has access',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  roleId: string;

  @ApiProperty({
    description: 'The section ID being accessed',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  sectionId: string;

  @ApiProperty({
    description: 'The role details',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: '550e8400-e29b-41d4-a716-446655440001',
      },
      name: {
        type: 'string',
        example: 'Admin',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
      },
    },
  })
  role?: {
    id: string;
    name: string;
    createdAt: Date;
  };

  @ApiProperty({
    description: 'The section details',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: '550e8400-e29b-41d4-a716-446655440002',
      },
      name: {
        type: 'string',
        example: 'Introduction',
      },
      parentId: {
        type: 'string',
        example: '550e8400-e29b-41d4-a716-446655440003',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
      },
    },
  })
  section?: {
    id: string;
    name: string;
    parentId?: string;
    createdAt: Date;
  };
}

export class DocumentPermissionResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the document access record',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'The role ID that has access',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  roleId: string;

  @ApiProperty({
    description: 'The document ID being accessed',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  documentId: string;

  @ApiProperty({
    description: 'The role details',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: '550e8400-e29b-41d4-a716-446655440001',
      },
      name: {
        type: 'string',
        example: 'Admin',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
      },
    },
  })
  role?: {
    id: string;
    name: string;
    createdAt: Date;
  };

  @ApiProperty({
    description: 'The document details',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: '550e8400-e29b-41d4-a716-446655440002',
      },
      name: {
        type: 'string',
        example: 'Document 1',
      },
      sectionId: {
        type: 'string',
        example: '550e8400-e29b-41d4-a716-446655440003',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
      },
    },
  })
  document?: {
    id: string;
    name: string;
    sectionId: string;
    createdAt: Date;
  };
}
