import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFormDto } from '../dto/create-form.dto';
import { UpdateFormDto } from '../dto/update-form.dto';

@Injectable()
export class FormsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFormDto: CreateFormDto) {
    return this.prisma.$transaction(async (tx) => {
      const form = await tx.form.create({
        data: {
          title: createFormDto.title,
          description: createFormDto.description,
          isActive: createFormDto.isActive ?? true,
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

  async getFormSubmissions(id: string) {
    await this.findOne(id);
    return this.prisma.formSubmission.findMany({
      where: { formId: id },
      include: {
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
