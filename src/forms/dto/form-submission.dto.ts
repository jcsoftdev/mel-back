import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FormSubmissionFieldResponseDto {
  @ApiProperty({
    description: 'Submission field unique identifier',
    example: 'subfield123',
  })
  id: string;

  @ApiProperty({
    description: 'Form field identifier',
    example: 'field123',
  })
  fieldId: string;

  @ApiPropertyOptional({
    description: 'Submitted value',
    example: 'John Doe',
  })
  value?: string;

  @ApiProperty({
    description: 'Field metadata',
    example: {
      id: 'field123',
      label: 'Full Name',
      fieldType: 'INPUT_TEXT',
    },
  })
  field: {
    id: string;
    label: string;
    fieldType: string;
  };
}

export class FileMetadataResponseDto {
  @ApiProperty({
    description: 'File metadata unique identifier',
    example: 'file123',
  })
  id: string;

  @ApiProperty({
    description: 'Form field identifier',
    example: 'field789',
  })
  fieldId: string;

  @ApiProperty({
    description: 'Original file name',
    example: 'resume.pdf',
  })
  fileName: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  fileSize: number;

  @ApiProperty({
    description: 'File MIME type',
    example: 'application/pdf',
  })
  mimeType: string;

  @ApiPropertyOptional({
    description: 'Google Drive file identifier',
    example: 'drive_file_123',
  })
  driveFileId?: string;

  @ApiProperty({
    description: 'File upload timestamp',
    example: '2024-01-15T14:30:00.000Z',
  })
  uploadedAt: Date;

  @ApiPropertyOptional({
    description: 'Base64 encoded file content',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
  })
  base64Content?: string;
}

export class FormSubmissionResponseDto {
  @ApiProperty({
    description: 'Submission unique identifier',
    example: 'sub123abc456def789',
  })
  id: string;

  @ApiProperty({
    description: 'Form identifier',
    example: 'clp123abc456def789',
  })
  formId: string;

  @ApiProperty({
    description: 'Submission timestamp',
    example: '2024-01-15T14:30:00.000Z',
  })
  submittedAt: Date;

  @ApiProperty({
    description: 'Submitted field values',
    type: [FormSubmissionFieldResponseDto],
  })
  fields: FormSubmissionFieldResponseDto[];

  @ApiProperty({
    description: 'Uploaded files metadata',
    type: [FileMetadataResponseDto],
  })
  files: FileMetadataResponseDto[];
}

export class FormSubmissionListResponseDto {
  @ApiProperty({
    description: 'Submission unique identifier',
    example: 'sub123abc456def789',
  })
  id: string;

  @ApiProperty({
    description: 'Form identifier',
    example: 'clp123abc456def789',
  })
  formId: string;

  @ApiProperty({
    description: 'Submission timestamp',
    example: '2024-01-15T14:30:00.000Z',
  })
  submittedAt: Date;

  @ApiProperty({
    description: 'Submission statistics',
    example: { fields: 3, files: 1 },
  })
  _count: {
    fields: number;
    files: number;
  };
}
