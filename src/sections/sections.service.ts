import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Section } from '@prisma/client';
import { SectionTree } from './types/section.types';

interface SectionWithRelations extends Section {
  parent?: Section | null;
  children?: SectionWithRelations[];
  documents?: any[];
  roleGrants?: any[];
}

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createSectionDto: CreateSectionDto): Promise<Section> {
    const { name, parentId } = createSectionDto;

    // Validate parent exists if parentId is provided
    if (parentId) {
      const parentSection = await this.prisma.section.findUnique({
        where: { id: parentId },
      });

      if (!parentSection) {
        throw new NotFoundException(
          `Parent section with ID ${parentId} not found`,
        );
      }
    }

    // Check for duplicate name within the same parent
    const existingSection = await this.prisma.section.findFirst({
      where: {
        name,
        parentId: parentId || null,
      },
    });

    if (existingSection) {
      throw new BadRequestException(
        `Section with name '${name}' already exists in this location`,
      );
    }

    return this.prisma.section.create({
      data: {
        name,
        parentId: parentId || null,
      },
      include: {
        parent: true,
        children: true,
        documents: true,
      },
    });
  }

  async findAll(parentId?: string): Promise<Section[]> {
    return this.prisma.section.findMany({
      where: {
        parentId: parentId || null,
      },
      include: {
        parent: true,
        children: {
          include: {
            children: true,
            documents: true,
          },
        },
        documents: true,
        roleGrants: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<Section> {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          include: {
            children: true,
            documents: true,
          },
        },
        documents: true,
        roleGrants: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    return section;
  }

  async update(
    id: string,
    updateSectionDto: UpdateSectionDto,
  ): Promise<Section> {
    const { name, parentId } = updateSectionDto;

    // Check if section exists
    const existingSection = await this.prisma.section.findUnique({
      where: { id },
    });

    if (!existingSection) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    // Validate parent exists if parentId is provided
    if (parentId !== undefined) {
      if (parentId === id) {
        throw new BadRequestException('Section cannot be its own parent');
      }

      if (parentId) {
        const parentSection = await this.prisma.section.findUnique({
          where: { id: parentId },
        });

        if (!parentSection) {
          throw new NotFoundException(
            `Parent section with ID ${parentId} not found`,
          );
        }

        // Check for circular reference
        const isCircular = await this.checkCircularReference(id, parentId);
        if (isCircular) {
          throw new BadRequestException(
            'Cannot move section: would create circular reference',
          );
        }
      }
    }

    // Check for duplicate name within the same parent (if name is being updated)
    if (name) {
      const duplicateSection = await this.prisma.section.findFirst({
        where: {
          name,
          parentId:
            parentId !== undefined ? parentId : existingSection.parentId,
          id: { not: id },
        },
      });

      if (duplicateSection) {
        throw new BadRequestException(
          `Section with name '${name}' already exists in this location`,
        );
      }
    }

    return this.prisma.section.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(parentId !== undefined && { parentId: parentId || null }),
      },
      include: {
        parent: true,
        children: true,
        documents: true,
      },
    });
  }

  async remove(id: string): Promise<Section> {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    if (section.children.length > 0) {
      throw new BadRequestException(
        'Cannot delete section with child sections. Delete children first.',
      );
    }

    return this.prisma.section.delete({
      where: { id },
    });
  }

  private async checkCircularReference(
    sectionId: string,
    newParentId: string,
  ): Promise<boolean> {
    let currentParentId: string | null = newParentId;

    while (currentParentId) {
      if (currentParentId === sectionId) {
        return true;
      }

      const parent = await this.prisma.section.findUnique({
        where: { id: currentParentId },
        select: { parentId: true },
      });

      currentParentId =
        (parent as { parentId?: string | null })?.parentId ?? null;
    }

    return false;
  }

  async getSectionTree(rootId?: string): Promise<SectionTree[]> {
    const sections = await this.prisma.section.findMany({
      where: {
        parentId: rootId || null,
      },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true,
                documents: true,
              },
              orderBy: { name: 'asc' },
            },
            documents: true,
          },
          orderBy: { name: 'asc' },
        },
        documents: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return this.buildSectionTree(sections);
  }

  private buildSectionTree(sections: SectionWithRelations[]): SectionTree[] {
    return sections.map((section) => ({
      id: section.id,
      name: section.name,
      parentId: section.parentId,
      documentCount: section.documents?.length || 0,
      children: section.children ? this.buildSectionTree(section.children) : [],
    }));
  }
}
