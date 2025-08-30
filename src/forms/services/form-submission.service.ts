import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleDriveService } from '../../google-drive/google-drive.service';
import { FormValidationService } from './form-validation.service';
import { SubmitFormDto } from '../dto/submit-form.dto';
import { FormSubmissionResponseDto } from '../dto/form-submission.dto';
import { FormFieldType } from '@prisma/client';

@Injectable()
export class FormSubmissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleDriveService: GoogleDriveService,
    private readonly formValidationService: FormValidationService,
  ) {}

  async submitForm(
    formId: string,
    submitFormDto: SubmitFormDto,
    files?: Array<{
      fieldname: string;
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    }>,
  ): Promise<{ id: string }> {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (!form.isActive) {
      throw new NotFoundException('Form is not active');
    }

    const formFields = form.fields.map((field) => ({
      id: field.id,
      fieldType: field.fieldType,
      label: field.label,
      isRequired: field.isRequired,
      validation: (field.validation as Record<string, any>) || {},
      options: (field.options as string[]) || [],
    }));

    const fileUploads =
      files?.map((file) => ({
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      })) || [];

    this.formValidationService.validateFormSubmission(
      formFields,
      submitFormDto.fields,
      fileUploads,
    );

    return await this.prisma.$transaction(async (tx) => {
      const submission = await tx.formSubmission.create({
        data: {
          formId,
          submittedAt: new Date(),
          ipAddress: submitFormDto.ipAddress,
          userAgent: submitFormDto.userAgent,
        },
      });

      for (const field of form.fields) {
        const fieldValue = submitFormDto.fields[field.id] as string | undefined;
        const file = files?.find((f) => f.fieldname === field.id);

        if (field.fieldType === FormFieldType.INPUT_FILE && file) {
          const driveFile = await this.googleDriveService.uploadFile(
            file.originalname,
            file.mimetype,
            file.buffer,
            form.driveId || undefined,
          );

          const fileMetadata = await tx.fileMetadata.create({
            data: {
              submissionId: submission.id,
              fieldId: field.id,
              originalName: file.originalname,
              fileName: driveFile.name || file.originalname,
              mimeType: file.mimetype,
              size: file.size,
              driveId: driveFile.id!,
              driveUrl: driveFile.webViewLink || '',
            },
          });

          await tx.formSubmissionField.create({
            data: {
              submissionId: submission.id,
              fieldId: field.id,
              value: fileMetadata.id,
            },
          });
        } else {
          const sanitizedValue = this.formValidationService.sanitizeValue(
            field.fieldType,
            fieldValue || null,
          );

          await tx.formSubmissionField.create({
            data: {
              submissionId: submission.id,
              fieldId: field.id,
              value: sanitizedValue,
            },
          });
        }
      }

      return { id: submission.id };
    });
  }

  async getFormSubmissions(
    formId: string,
  ): Promise<FormSubmissionResponseDto[]> {
    const submissions = await this.prisma.formSubmission.findMany({
      where: { formId },
      include: {
        fields: {
          include: {
            field: true,
          },
        },
        files: true,
      },
      orderBy: { submittedAt: 'desc' },
    });

    return submissions.map((submission) => ({
      id: submission.id,
      formId: submission.formId,
      submittedAt: submission.submittedAt,
      fields: submission.fields.map((field) => ({
        id: field.id,
        fieldId: field.fieldId,
        value: field.value || undefined,
        field: {
          id: field.field.id,
          label: field.field.label,
          fieldType: field.field.fieldType.toString(),
        },
      })),
      files: submission.files.map((file) => ({
        id: file.id,
        fieldId: file.fieldId,
        fileName: file.fileName,
        fileSize: file.size,
        mimeType: file.mimeType,
        driveFileId: file.driveId,
        uploadedAt: file.uploadedAt,
      })),
    }));
  }

  async getSubmission(
    submissionId: string,
  ): Promise<FormSubmissionResponseDto> {
    const submission = await this.prisma.formSubmission.findUnique({
      where: { id: submissionId },
      include: {
        fields: {
          include: {
            field: true,
          },
        },
        files: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Form submission not found');
    }

    return {
      id: submission.id,
      formId: submission.formId,
      submittedAt: submission.submittedAt,
      fields: submission.fields.map((field) => ({
        id: field.id,
        fieldId: field.fieldId,
        value: field.value || undefined,
        field: {
          id: field.field.id,
          label: field.field.label,
          fieldType: field.field.fieldType.toString(),
        },
      })),
      files: submission.files.map((file) => ({
        id: file.id,
        fieldId: file.fieldId,
        fileName: file.fileName,
        fileSize: file.size,
        mimeType: file.mimeType,
        driveFileId: file.driveId,
        uploadedAt: file.uploadedAt,
      })),
    };
  }

  async deleteSubmission(submissionId: string): Promise<void> {
    const submission = await this.prisma.formSubmission.findUnique({
      where: { id: submissionId },
      include: {
        files: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Form submission not found');
    }

    await this.prisma.$transaction(async (tx) => {
      for (const file of submission.files) {
        try {
          await this.googleDriveService.deleteFile(file.driveId);
        } catch (error) {
          console.error(
            `Failed to delete file from Google Drive: ${file.driveId}`,
            error,
          );
        }
      }

      await tx.formSubmission.delete({
        where: { id: submissionId },
      });
    });
  }
}
