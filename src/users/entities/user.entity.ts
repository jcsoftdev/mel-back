import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The date and time when the user was created',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The roles assigned to the user',
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
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        roleId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440002',
        },
        role: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440002',
            },
            name: { type: 'string', example: 'Admin' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    required: false,
  })
  roles?: {
    id: string;
    userId: string;
    roleId: string;
    role: {
      id: string;
      name: string;
      createdAt: Date;
    };
  }[];
}
