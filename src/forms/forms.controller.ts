import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { FormsService } from './services/forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { FormResponseDto, FormListResponseDto } from './dto/form.dto';
import { FormSubmissionResponseDto } from './dto/form-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('forms')
@ApiBearerAuth('JWT-auth')
@Controller('forms')
@UseGuards(JwtAuthGuard)
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a form',
  })
  @ApiCreatedResponse({
    description: 'Form created',
    type: FormResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  create(@Body() createFormDto: CreateFormDto) {
    return this.formsService.create(createFormDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all forms' })
  @ApiOkResponse({
    description: 'List of forms',
    type: FormListResponseDto,
    isArray: true,
  })
  findAll() {
    return this.formsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a form by id' })
  @ApiOkResponse({
    description: 'Form',
    type: FormResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Form not found' })
  findOne(@Param('id') id: string) {
    return this.formsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a form',
  })
  @ApiOkResponse({
    description: 'Updated form',
    type: FormResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Form not found' })
  update(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto) {
    return this.formsService.update(id, updateFormDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a form' })
  @ApiOkResponse({ description: 'Form deleted' })
  @ApiNotFoundResponse({ description: 'Form not found' })
  remove(@Param('id') id: string) {
    return this.formsService.remove(id);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle a form active state' })
  @ApiOkResponse({ description: 'Toggled active state' })
  @ApiNotFoundResponse({ description: 'Form not found' })
  toggleActive(@Param('id') id: string) {
    return this.formsService.toggleActive(id);
  }

  @Get(':id/submissions')
  @ApiOperation({ summary: 'Get submissions for a form' })
  @ApiOkResponse({
    description: 'Form submissions',
    type: FormSubmissionResponseDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Form not found' })
  getSubmissions(@Param('id') id: string) {
    return this.formsService.getFormSubmissions(id);
  }

  @Get(':id/submissions/csv')
  @ApiOperation({ summary: 'Download form submissions as CSV' })
  @ApiOkResponse({ description: 'CSV file downloaded' })
  @ApiNotFoundResponse({ description: 'Form not found' })
  async downloadSubmissionsCsv(@Param('id') id: string, @Res() res: Response) {
    const submissions = await this.formsService.getFormSubmissions(id);

    if (submissions.length === 0) {
      const csv = 'No submissions found\n';
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="submissions.csv"',
      );
      return res.send(csv);
    }

    const fields = submissions[0].fields.map((f) => f.field);
    const headers = [
      'Submitted At',
      'User Email',
      ...fields.map((f) => f.label),
    ];

    const rows = submissions.map((sub) => {
      const values = fields.map((field) => {
        if (field.fieldType === 'INPUT_FILE') {
          const file = sub.files.find((f) => f.fieldId === field.id);
          return file ? file.driveUrl : '';
        } else {
          const subField = sub.fields.find((f) => f.fieldId === field.id);
          return subField ? subField.value || '' : '';
        }
      });
      return [sub.submittedAt.toISOString(), sub.user?.email || '', ...values];
    });

    const csv = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map((row) =>
        row.map((v) => `"${(v || '').replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${id}-submissions.csv"`,
    );
    res.send(csv);
  }
}
