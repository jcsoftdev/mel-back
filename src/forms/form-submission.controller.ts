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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FormSubmissionService } from './services/form-submission.service';
import { SubmitFormDto } from './dto/submit-form.dto';
import { FormSubmissionResponseDto } from './dto/form-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Form Submissions')
@Controller('form-submissions')
export class FormSubmissionController {
  constructor(private readonly formSubmissionService: FormSubmissionService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a form with optional file uploads' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Form submission data with optional files',
    schema: {
      type: 'object',
      properties: {
        formId: {
          type: 'string',
          example: 'clp123abc456def789',
          description: 'Form identifier',
        },
        fields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              fieldId: {
                type: 'string',
                example: 'field123',
                description: 'Form field identifier',
              },
              value: {
                type: 'string',
                example: 'John Doe',
                description: 'Field value',
              },
            },
          },
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Optional file uploads (max 10 files)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Form submitted successfully',
    type: FormSubmissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid form data' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  @UseInterceptors(FilesInterceptor('files', 10))
  async submitForm(
    @Body() submitFormDto: SubmitFormDto,
    @UploadedFiles() files: any[],
    @Req() request: Request,
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
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific form submission' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Form submission retrieved successfully',
    type: FormSubmissionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  @UseGuards(JwtAuthGuard)
  getSubmission(@Param('id') id: string) {
    return this.formSubmissionService.getSubmission(id);
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
