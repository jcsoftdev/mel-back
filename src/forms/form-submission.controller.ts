import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

type UploadedFile = {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FormSubmissionService } from './services/form-submission.service';
import { SubmitFormDto } from './dto/submit-form.dto';
import { FormSubmissionResponseDto } from './dto/form-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
// using Express.Multer.File[] for uploaded files (multer types are provided by installed packages)

@ApiTags('Form Submissions')
@Controller('form-submissions')
export class FormSubmissionController {
  constructor(private readonly formSubmissionService: FormSubmissionService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a form with optional file uploads' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Form submitted successfully',
    type: FormSubmissionResponseDto,
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 400, description: 'Invalid form data' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  async submitForm(
    @Body()
    submitFormDto: SubmitFormDto,
    @UploadedFiles() files: UploadedFile[],
    @Req() request: Request,
    @CurrentUser() user?: { id: string },
  ) {
    const ipAddress = request.ip || request.connection.remoteAddress;
    const userAgent = request.get('User-Agent');

    const submissionData = {
      ...submitFormDto,
      ipAddress,
      userAgent,
    };

    return this.formSubmissionService.submitForm(
      submitFormDto.formId,
      submissionData,
      files,
      user?.id,
    );
  }

  @Get('form/:formId/my')
  @ApiOperation({
    summary: "Get the authenticated user's latest submission for a form",
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Form submission retrieved successfully',
    type: FormSubmissionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  @UseGuards(JwtAuthGuard)
  getMySubmission(
    @Param('formId') formId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.formSubmissionService.getMySubmission(formId, user.id);
  }

  @Get('form/:formId')
  @ApiOperation({ summary: 'Get all submissions for a form' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  getFormSubmissions(@Param('formId') formId: string) {
    return this.formSubmissionService.getFormSubmissions(formId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a form submission' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Form submission deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  @UseGuards(JwtAuthGuard)
  deleteSubmission(@Param('id') id: string) {
    return this.formSubmissionService.deleteSubmission(id);
  }
}
