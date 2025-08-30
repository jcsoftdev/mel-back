import { Module } from '@nestjs/common';
import { FormsService } from './services/forms.service';
import { FormSubmissionService } from './services/form-submission.service';
import { FormValidationService } from './services/form-validation.service';
import { FormsController } from './forms.controller';
import { FormSubmissionController } from './form-submission.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GoogleDriveModule } from '../google-drive/google-drive.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, GoogleDriveModule, AuthModule],
  controllers: [FormsController, FormSubmissionController],
  providers: [FormsService, FormSubmissionService, FormValidationService],
  exports: [FormsService, FormSubmissionService, FormValidationService],
})
export class FormsModule {}
