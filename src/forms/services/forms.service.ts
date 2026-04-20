import { Injectable, NotFoundException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import sharp from 'sharp';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleDriveService } from '../../google-drive/google-drive.service';
import { CreateFormDto } from '../dto/create-form.dto';
import { UpdateFormDto } from '../dto/update-form.dto';

const THUMB_PX = 120;
const DRIVE_CONCURRENCY = 10;

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

@Injectable()
export class FormsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  async create(createFormDto: CreateFormDto) {
    return this.prisma.$transaction(async (tx) => {
      const form = await tx.form.create({
        data: {
          title: createFormDto.title,
          description: createFormDto.description,
          isActive: createFormDto.isActive ?? false,
          driveId: createFormDto.driveId,
        },
      });

      await Promise.all(
        createFormDto.fields.map((field, index) =>
          tx.formField.create({
            data: {
              formId: form.id,
              label: field.label,
              fieldType: field.fieldType,
              isRequired: field.isRequired,
              order: index,
              options: field.options,
              validation: field.validation,
            },
          }),
        ),
      );

      return tx.form.findUnique({
        where: { id: form.id },
        include: {
          fields: {
            orderBy: { order: 'asc' },
          },
        },
      });
    });
  }

  async findAll() {
    return this.prisma.form.findMany({
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        submissions: {
          orderBy: { submittedAt: 'desc' },
          include: {
            user: true,
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException(`Form with ID ${id} not found`);
    }

    return form;
  }

  async update(id: string, updateFormDto: UpdateFormDto) {
    return this.prisma.$transaction(async (tx) => {
      const existingForm = await tx.form.findUnique({
        where: { id },
        include: { fields: true },
      });

      if (!existingForm) {
        throw new NotFoundException(`Form with ID ${id} not found`);
      }

      await tx.form.update({
        where: { id },
        data: {
          title: updateFormDto.title ?? existingForm.title,
          description: updateFormDto.description ?? existingForm.description,
          isActive: updateFormDto.isActive ?? existingForm.isActive,
        },
      });

      if (updateFormDto.fields) {
        await tx.formField.deleteMany({
          where: { formId: id },
        });

        await Promise.all(
          updateFormDto.fields.map((field, index) =>
            tx.formField.create({
              data: {
                formId: id,
                label: field.label,
                fieldType: field.fieldType,
                isRequired: field.isRequired,
                order: index,
                options: field.options,
                validation: field.validation,
              },
            }),
          ),
        );
      }

      return tx.form.findUnique({
        where: { id },
        include: {
          fields: {
            orderBy: { order: 'asc' },
          },
        },
      });
    });
  }

  async remove(id: string) {
    return this.prisma.form.delete({
      where: { id },
    });
  }

  async toggleActive(id: string) {
    const form = await this.findOne(id);
    return this.prisma.form.update({
      where: { id },
      data: { isActive: !form.isActive },
    });
  }

  async exportSubmissionsXlsx(
    id: string,
    range?: { from?: Date; to?: Date },
  ): Promise<{ buffer: Uint8Array; filename: string; title: string }> {
    const form = await this.findOne(id);
    const where: Record<string, unknown> = { formId: id };
    if (range?.from || range?.to) {
      const submittedAt: Record<string, Date> = {};
      if (range.from) submittedAt.gte = range.from;
      if (range.to) submittedAt.lte = range.to;
      where.submittedAt = submittedAt;
    }
    const submissions = await this.prisma.formSubmission.findMany({
      where,
      include: {
        user: true,
        files: true,
        fields: { include: { field: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const formFields = [...form.fields].sort((a, b) => a.order - b.order);
    const fileFieldIds = new Set(
      formFields.filter((f) => f.fieldType === 'INPUT_FILE').map((f) => f.id),
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Melanie';
    workbook.created = new Date();
    const sheet = workbook.addWorksheet(form.title.slice(0, 28) || 'Envíos');

    type ColumnSpec =
      | { kind: 'meta'; label: string; key: 'submittedAt' | 'userEmail' }
      | { kind: 'text'; label: string; fieldId: string }
      | { kind: 'image'; label: string; fieldId: string }
      | { kind: 'url'; label: string; fieldId: string };

    const columns: ColumnSpec[] = [
      { kind: 'meta', label: 'Enviado el', key: 'submittedAt' },
      { kind: 'meta', label: 'Usuario', key: 'userEmail' },
    ];
    formFields.forEach((f) => {
      if (fileFieldIds.has(f.id)) {
        columns.push({ kind: 'image', label: f.label, fieldId: f.id });
        columns.push({ kind: 'url', label: `${f.label} (URL)`, fieldId: f.id });
      } else {
        columns.push({ kind: 'text', label: f.label, fieldId: f.id });
      }
    });

    sheet.addRow(columns.map((c) => c.label));
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { vertical: 'middle' };

    columns.forEach((c, i) => {
      const col = sheet.getColumn(i + 1);
      if (c.kind === 'image') col.width = 22;
      else if (c.kind === 'url') col.width = 18;
      else if (c.kind === 'meta' && c.key === 'submittedAt') col.width = 22;
      else col.width = 28;
    });

    type ImageJob = {
      rowIndex: number;
      colIndex: number;
      driveId: string;
    };
    const imageJobs: ImageJob[] = [];

    for (const submission of submissions) {
      const row: (string | Date)[] = columns.map((c) => {
        if (c.kind === 'meta') {
          return c.key === 'submittedAt'
            ? submission.submittedAt
            : submission.user?.email || '';
        }
        if (c.kind === 'text') {
          const sf = submission.fields.find((f) => f.fieldId === c.fieldId);
          return sf?.value || '';
        }
        return '';
      });

      const excelRow = sheet.addRow(row);
      const excelRowIndex = excelRow.number;
      let rowHasImage = false;

      columns.forEach((c, colIdx) => {
        const cell = excelRow.getCell(colIdx + 1);
        if (c.kind === 'image') {
          const file = submission.files.find((f) => f.fieldId === c.fieldId);
          if (file) {
            imageJobs.push({
              rowIndex: excelRowIndex,
              colIndex: colIdx + 1,
              driveId: file.driveId,
            });
            rowHasImage = true;
          }
        } else if (c.kind === 'url') {
          const file = submission.files.find((f) => f.fieldId === c.fieldId);
          if (file) {
            cell.value = {
              text: 'Ver original',
              hyperlink: file.driveUrl,
            };
            cell.font = { color: { argb: 'FF1A73E8' }, underline: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
        }
      });

      excelRow.getCell(1).numFmt = 'yyyy-mm-dd hh:mm';
      if (rowHasImage) excelRow.height = 95;
    }

    const resized = await mapWithConcurrency(
      imageJobs,
      DRIVE_CONCURRENCY,
      async (job) => {
        try {
          const raw = await this.googleDriveService.getFileAsBuffer(
            job.driveId,
          );
          const thumb = await sharp(raw)
            .rotate()
            .resize(THUMB_PX, THUMB_PX, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .png()
            .toBuffer();
          return { job, buffer: thumb };
        } catch (err) {
          console.error(`xlsx: thumb failed for ${job.driveId}`, err);
          return null;
        }
      },
    );

    let embedded = 0;
    for (const entry of resized) {
      if (!entry) continue;
      const { job, buffer } = entry;
      const base64 = `data:image/png;base64,${buffer.toString('base64')}`;
      const imageId = workbook.addImage({ base64, extension: 'png' });
      sheet.addImage(imageId, {
        tl: { col: job.colIndex - 1, row: job.rowIndex - 1 },
        br: { col: job.colIndex, row: job.rowIndex },
        editAs: 'oneCell',
      });
      embedded++;
    }
    console.log(
      `xlsx export form=${id} submissions=${submissions.length} imageJobs=${imageJobs.length} embedded=${embedded}`,
    );

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    const buffer = new Uint8Array(arrayBuffer as ArrayBuffer);
    const safeTitle = form.title.replace(/[^a-zA-Z0-9_-]+/g, '_') || 'form';
    const date = new Date().toISOString().split('T')[0];
    const filename = `${safeTitle}_submissions_${date}.xlsx`;
    return { buffer, filename, title: form.title };
  }

  async getFormSubmissions(
    id: string,
    range?: { from?: Date; to?: Date },
  ) {
    await this.findOne(id);
    const where: Record<string, unknown> = { formId: id };
    if (range?.from || range?.to) {
      const submittedAt: Record<string, Date> = {};
      if (range.from) submittedAt.gte = range.from;
      if (range.to) submittedAt.lte = range.to;
      where.submittedAt = submittedAt;
    }
    return this.prisma.formSubmission.findMany({
      where,
      include: {
        user: true,
        files: true,
        fields: {
          include: {
            field: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }
}
