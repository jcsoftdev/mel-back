import { ApiProperty } from '@nestjs/swagger';

export class Role {
  @ApiProperty({
    description: 'The unique identifier of the role',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the role',
    example: 'Admin',
  })
  name: string;

  @ApiProperty({
    description: 'The date and time when the role was created',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Users assigned to this role',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440001',
        },
        userId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440002',
        },
        roleId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
    required: false,
  })
  userRoles?: {
    id: string;
    userId: string;
    roleId: string;
  }[];

  @ApiProperty({
    description: 'Section access permissions for this role',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440003',
        },
        roleId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        sectionId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440004',
        },
      },
    },
    required: false,
  })
  sectionAccess?: {
    id: string;
    roleId: string;
    sectionId: string;
  }[];

  @ApiProperty({
    description: 'Document access permissions for this role',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440005',
        },
        roleId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        documentId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440006',
        },
      },
    },
    required: false,
  })
  documentAccess?: {
    id: string;
    roleId: string;
    documentId: string;
  }[];
}
