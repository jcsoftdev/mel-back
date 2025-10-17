import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleDriveService } from '../../google-drive/google-drive.service';
import { FormValidationService } from './form-validation.service';
import { SubmitFormDto, SubmitFormFieldDto } from '../dto/submit-form.dto';
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
    userId?: string,
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

    console.log(JSON.stringify(submitFormDto, null, 2));

    // Handle case when fields is a string (from multipart/form-data)
    let fieldsArray = submitFormDto.fields;
    if (typeof submitFormDto.fields === 'string') {
      try {
        fieldsArray = JSON.parse(submitFormDto.fields) as SubmitFormFieldDto[];
      } catch {
        throw new BadRequestException(
          'Invalid fields format. Fields must be a valid JSON array.',
        );
      }
    }

    const fieldsObject = fieldsArray.reduce(
      (acc, field) => {
        acc[field.fieldId] = field.value || '';
        return acc;
      },
      {} as Record<string, string>,
    );

    this.formValidationService.validateFormSubmission(
      formFields,
      fieldsObject,
      fileUploads,
    );

    return await this.prisma.$transaction(async (tx) => {
      const submission = await tx.formSubmission.create({
        data: {
          formId,
          userId: userId || null,
          submittedAt: new Date(),
          ipAddress: submitFormDto.ipAddress,
          userAgent: submitFormDto.userAgent,
        },
      });

      for (const field of form.fields) {
        const fieldSubmission = fieldsArray.find((f) => f.fieldId === field.id);
        const fieldValue = fieldSubmission?.value;
        // Look for a file with fieldname matching the field id or with fieldname in format 'fieldId_index'
        const file = files?.find((f) => {
          // Match exact fieldname or fieldname with format 'fieldId_index'
          return f.originalname === field.id;
        });

        if (field.fieldType === FormFieldType.INPUT_FILE && file) {
          console.log(JSON.stringify(file, null, 2));
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

  // Return the latest submission by the authenticated user for a given form
  async getMySubmission(
    formId: string,
    userId: string,
  ): Promise<FormSubmissionResponseDto> {
    const submission = await this.prisma.formSubmission.findFirst({
      where: { formId, userId },
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

    if (!submission) {
      throw new NotFoundException(
        'Form submission not found for this user and form',
      );
    }

    const filesWithBase64 = await Promise.all(
      submission.files.map(async (file) => {
        let base64Content: string | undefined;
        try {
          if (file.driveId) {
            base64Content = await this.googleDriveService.getFileAsBase64(
              file.driveId,
            );
          }
        } catch (error) {
          console.error(
            `Failed to get base64 content for file ${file.id}:`,
            error,
          );
        }

        return {
          id: file.id,
          fieldId: file.fieldId,
          fileName: file.fileName,
          fileSize: file.size,
          mimeType: file.mimeType,
          driveFileId: file.driveId,
          uploadedAt: file.uploadedAt,
          base64Content,
        };
      }),
    );

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
      files: filesWithBase64,
    };
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

  async updateSubmission(
    submissionId: string,
    updateFields: SubmitFormFieldDto[],
    files?: Array<{
      fieldname: string;
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    }>,
  ): Promise<FormSubmissionResponseDto> {
    // Get the existing submission with its form data
    const submission = await this.prisma.formSubmission.findUnique({
      where: { id: submissionId },
      include: {
        form: {
          include: {
            fields: {
              orderBy: { order: 'asc' },
            },
          },
        },
        fields: true,
        files: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Form submission not found');
    }

    // Validate the updated fields
    const formFields = submission.form.fields.map((field) => ({
      id: field.id,
      fieldType: field.fieldType,
      label: field.label,
      isRequired: field.isRequired,
      validation: (field.validation as Record<string, any>) || {},
      options: field.options as string[] | undefined,
    }));

    // Validate each submitted field
    const submissionData: Record<string, string> = {};
    for (const submittedField of updateFields) {
      const formField = formFields.find((f) => f.id === submittedField.fieldId);
      if (!formField) {
        throw new BadRequestException(
          `Field ${submittedField.fieldId} not found in form`,
        );
      }

      const file = files?.find((f) => f.fieldname === submittedField.fieldId);
      this.formValidationService.validateFieldValue(
        formField,
        submittedField.value || null,
        file,
      );

      if (submittedField.value) {
        submissionData[submittedField.fieldId] = submittedField.value;
      }
    }

    // Update submission in transaction
    return this.prisma.$transaction(async (tx) => {
      // Update the submission timestamp
      await tx.formSubmission.update({
        where: { id: submissionId },
        data: {
          submittedAt: new Date(),
        },
      });

      // Delete old field submissions
      await tx.formSubmissionField.deleteMany({
        where: { submissionId },
      });

      // Create new field submissions
      await Promise.all(
        updateFields.map((field) =>
          tx.formSubmissionField.create({
            data: {
              submissionId,
              fieldId: field.fieldId,
              value: field.value || null,
            },
          }),
        ),
      );

      // Handle file updates if provided
      if (files && files.length > 0) {
        // Delete old files from Google Drive
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

        // Delete old file records
        await tx.fileMetadata.deleteMany({
          where: { submissionId },
        });

        // Upload new files
        for (const file of files) {
          if (file.size > 0) {
            const driveId = submission.form.driveId;
            if (!driveId) {
              throw new BadRequestException('Form drive ID is not configured');
            }

            const uploadedFile = await this.googleDriveService.uploadFile(
              driveId,
              file.originalname,
              file.buffer,
              file.mimetype,
            );

            await tx.fileMetadata.create({
              data: {
                submissionId,
                fieldId: file.fieldname,
                fileName: file.originalname,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                driveId: uploadedFile.id as string,
                driveUrl: (uploadedFile.webViewLink ||
                  uploadedFile.id) as string,
              },
            });
          }
        }
      }

      // Fetch and return updated submission
      const updated = await tx.formSubmission.findUnique({
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

      if (!updated) {
        throw new NotFoundException('Form submission not found after update');
      }

      return {
        id: updated.id,
        formId: updated.formId,
        submittedAt: updated.submittedAt,
        fields: updated.fields.map((field) => ({
          id: field.id,
          fieldId: field.fieldId,
          value: field.value || undefined,
          field: {
            id: field.field.id,
            label: field.field.label,
            fieldType: field.field.fieldType.toString(),
          },
        })),
        files: updated.files.map((file) => ({
          id: file.id,
          fieldId: file.fieldId,
          fileName: file.fileName,
          fileSize: file.size,
          mimeType: file.mimeType,
          driveFileId: file.driveId,
          uploadedAt: file.uploadedAt,
        })),
      };
    });
  }
}
