import { FormField, FormSubmission } from '@prisma/client';

export class FormEntity {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  driveId: string | null;
}

export class FormWithFields extends FormEntity {
  fields: FormField[];
}

export class FormWithSubmissions extends FormEntity {
  submissions: FormSubmission[];
}

export class FormComplete extends FormEntity {
  fields: FormField[];
  submissions: FormSubmission[];
}
