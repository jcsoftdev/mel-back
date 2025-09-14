import { Injectable, BadRequestException } from '@nestjs/common';
import { FormFieldType } from '@prisma/client';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  maxSize?: number;
  allowedTypes?: string[];
}

interface FileUpload {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
}

interface FormFieldWithValidation {
  id: string;
  fieldType: FormFieldType;
  label: string;
  isRequired: boolean;
  validation?: ValidationRule;
  options?: string[];
}

@Injectable()
export class FormValidationService {
  validateFieldValue(
    field: FormFieldWithValidation,
    value: string | null,
    file?: FileUpload,
  ): void {
    if (
      field.isRequired &&
      this.isEmpty(value, field.fieldType, file) &&
      field.fieldType !== FormFieldType.INPUT_FILE
    ) {
      throw new BadRequestException(`${field.label} is required`);
    }

    if (this.isEmpty(value, field.fieldType, file)) {
      return;
    }

    switch (field.fieldType) {
      case FormFieldType.INPUT_TEXT:
        this.validateTextInput(field, value as string);
        break;
      case FormFieldType.SELECT:
        this.validateSelectInput(field, value as string);
        break;
      case FormFieldType.INPUT_FILE:
        this.validateFileInput(field, file);
        break;
    }
  }

  private isEmpty(
    value: string | null,
    fieldType: FormFieldType,
    file?: FileUpload,
  ): boolean {
    console.log({ value, fieldType, file });
    if (fieldType === FormFieldType.INPUT_FILE) {
      return !file;
    }
    return !value || value.trim() === '';
  }

  private validateTextInput(
    field: FormFieldWithValidation,
    value: string,
  ): void {
    const validation = field.validation;
    if (!validation) return;

    if (validation.minLength && value.length < validation.minLength) {
      throw new BadRequestException(
        `${field.label} must be at least ${validation.minLength} characters long`,
      );
    }

    if (validation.maxLength && value.length > validation.maxLength) {
      throw new BadRequestException(
        `${field.label} must be no more than ${validation.maxLength} characters long`,
      );
    }

    if (validation.pattern) {
      try {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          throw new BadRequestException(`${field.label} format is invalid`);
        }
      } catch {
        throw new BadRequestException(`Invalid pattern for ${field.label}`);
      }
    }
  }

  private validateSelectInput(
    field: FormFieldWithValidation,
    value: string,
  ): void {
    if (!field.options || !Array.isArray(field.options)) {
      throw new BadRequestException(
        `${field.label} has no valid options configured`,
      );
    }

    if (!field.options.includes(value)) {
      throw new BadRequestException(
        `${field.label} must be one of: ${field.options.join(', ')}`,
      );
    }
  }

  private validateFileInput(
    field: FormFieldWithValidation,
    file?: FileUpload,
  ): void {
    if (!file) {
      if (field.isRequired) {
        throw new BadRequestException(`${field.label} file is required`);
      }
      return;
    }

    const validation = field.validation;
    if (!validation) return;

    if (validation.maxSize && file && file.size > validation.maxSize) {
      const maxSizeMB = (validation.maxSize / (1024 * 1024)).toFixed(2);
      throw new BadRequestException(
        `${field.label} file size must be less than ${maxSizeMB}MB`,
      );
    }

    if (validation.allowedTypes && validation.allowedTypes.length > 0 && file) {
      const isValidType = validation.allowedTypes.some((type) => {
        if (type.startsWith('.')) {
          return file.originalname.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.mimetype.toLowerCase().includes(type.toLowerCase());
      });

      if (!isValidType) {
        throw new BadRequestException(
          `${field.label} file type not allowed. Allowed types: ${validation.allowedTypes.join(', ')}`,
        );
      }
    }
  }

  validateFormSubmission(
    fields: FormFieldWithValidation[],
    submissionData: Record<string, string>,
    files?: FileUpload[],
  ): void {
    for (const field of fields) {
      const value = submissionData[field.id];
      const fieldFiles =
        files?.filter((file) => file.fieldname === field.id) || [];
      const file = fieldFiles[0];
      console.log({ field, value, file, fieldFiles, files });
      this.validateFieldValue(field, value, file);
    }
  }

  sanitizeValue(fieldType: FormFieldType, value: string | null): string | null {
    if (!value) {
      return null;
    }

    switch (fieldType) {
      case FormFieldType.INPUT_TEXT:
      case FormFieldType.SELECT:
        return value.trim();
      case FormFieldType.INPUT_FILE:
        return null;
      default:
        return value;
    }
  }
}
