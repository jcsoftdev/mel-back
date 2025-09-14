import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Form, Section } from '@prisma/client';
import { SectionTree, SectionWithRelations } from './types/section.types';
import { RoleAccessService } from '../common/services/role-access.service';
import { forms } from 'googleapis/build/src/apis/forms';

@Injectable()
export class SectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleAccessService: RoleAccessService,
  ) {}
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

  async findAllByUserRoles(
    userRoles: string[],
    parentId?: string,
  ): Promise<Section[]> {
    const accessibleSectionIds =
      await this.roleAccessService.getUserAccessibleSectionIds(userRoles);

    if (accessibleSectionIds.length === 0) {
      return [];
    }

    return this.prisma.section.findMany({
      where: {
        id: {
          in: accessibleSectionIds,
        },
        parentId: parentId || null,
      },
      include: {
        parent: true,
        children: {
          where: {
            id: {
              in: accessibleSectionIds,
            },
          },
          include: {
            children: {
              where: {
                id: {
                  in: accessibleSectionIds,
                },
              },
            },
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

    const forms = await this.prisma.form.findMany();

    return this.buildSectionTree(sections, forms)[0].children;
  }

  async getSectionTreeByUserRoles(
    userRoles: string[],
    rootId?: string,
  ): Promise<SectionTree[]> {
    console.log({ userRoles });
    const { allSectionIds, directSectionIds, documentIds } =
      await this.roleAccessService.getUserRoleAccessData(userRoles);

    if (allSectionIds.length === 0 && documentIds.length === 0) {
      return [];
    }

    const sectionsWithDirectAccess = new Set(directSectionIds);
    const documentsWithDirectAccess = new Set(documentIds);

    const descendantSectionIds =
      await this.getDescendantSections(directSectionIds);
    const allRelevantSectionIds = [
      ...new Set([...allSectionIds, ...descendantSectionIds]),
    ];

    const [allSections, allDocuments, allForms] = await Promise.all([
      this.prisma.section.findMany({
        where: {
          id: {
            in: allRelevantSectionIds,
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.document.findMany({
        where: {
          sectionId: {
            in: allRelevantSectionIds,
          },
        },
        select: {
          id: true,
          title: true,
          url: true,
          driveId: true,
          sectionId: true,
          createdAt: true,
        },
      }),
      this.prisma.form.findMany(),
    ]);

    const sectionsWithDocuments = allSections.map(
      (section): SectionWithRelations => {
        const hasDirectSectionAccess = sectionsWithDirectAccess.has(section.id);
        const isDescendantOfDirectAccess = this.isDescendantOfDirectAccess(
          section,
          directSectionIds,
          allSections,
        );

        let sectionDocuments: {
          id: string;
          title: string;
          url: string;
          driveId?: string | null;
          sectionId: string;
          createdAt: Date;
        }[];
        if (hasDirectSectionAccess) {
          // If user has direct access to section, show all documents
          sectionDocuments = allDocuments.filter(
            (doc) => doc.sectionId === section.id,
          );
        } else if (isDescendantOfDirectAccess) {
          // If section is descendant of direct access, show all documents
          sectionDocuments = allDocuments.filter(
            (doc) => doc.sectionId === section.id,
          );
        } else {
          // For other sections, only show documents with direct access
          sectionDocuments = allDocuments.filter(
            (doc) =>
              doc.sectionId === section.id &&
              documentsWithDirectAccess.has(doc.id),
          );
        }

        const forms = allForms
          .filter((form) => form.driveId === section.driveId && form.isActive)
          .map((form) => ({
            id: form.id,
            driveId: form.driveId as string,
          }));

        return {
          ...section,
          documents: sectionDocuments,
          forms: forms,
        };
      },
    );

    const sectionsWithAccessibleChildren = new Set<string>();

    sectionsWithDocuments.forEach((section) => {
      const hasDirectSectionAccess = sectionsWithDirectAccess.has(section.id);
      const hasDocumentsWithAccess = (section.documents || []).length > 0;

      if (hasDirectSectionAccess || hasDocumentsWithAccess) {
        let currentParentId = section.parentId;
        while (currentParentId) {
          sectionsWithAccessibleChildren.add(currentParentId);
          const parentSection = sectionsWithDocuments.find(
            (s) => s.id === currentParentId,
          );
          currentParentId = parentSection?.parentId || null;
        }
      }
    });

    const filteredSections = sectionsWithDocuments.filter((section) => {
      const hasDirectSectionAccess = sectionsWithDirectAccess.has(section.id);
      const hasDocumentsWithAccess = (section.documents || []).length > 0;
      const hasAccessibleChildren = sectionsWithAccessibleChildren.has(
        section.id,
      );
      const hasForms = section.forms && section.forms.length > 0;

      return (
        hasDirectSectionAccess ||
        hasDocumentsWithAccess ||
        hasAccessibleChildren ||
        hasForms
      );
    });

    const rootSections = filteredSections.filter(
      (section) => section.parentId === (rootId || null),
    );

    return this.buildOptimizedSectionTree(rootSections, filteredSections)?.[0]
      ?.children;
  }

  private async getDescendantSections(sectionIds: string[]): Promise<string[]> {
    if (sectionIds.length === 0) {
      return [];
    }

    const descendants = new Set<string>();
    let currentIds = [...sectionIds];

    while (currentIds.length > 0) {
      const children = await this.prisma.section.findMany({
        where: {
          parentId: {
            in: currentIds,
          },
        },
        select: {
          id: true,
        },
      });

      const childIds = children.map((child) => child.id);
      childIds.forEach((id) => descendants.add(id));
      currentIds = childIds;
    }

    return Array.from(descendants);
  }

  private isDescendantOfDirectAccess(
    section: Section,
    directSectionIds: string[],
    allSections: Section[],
  ): boolean {
    let currentParentId = section.parentId;

    while (currentParentId) {
      if (directSectionIds.includes(currentParentId)) {
        return true;
      }

      const parentSection = allSections.find((s) => s.id === currentParentId);
      currentParentId = parentSection?.parentId || null;
    }

    return false;
  }

  private buildSectionTree(
    sections: SectionWithRelations[],
    allForms: Form[],
  ): SectionTree[] {
    const returnSections = sections.map((section): SectionTree => {
      const forms = allForms
        .filter((form) => form.driveId === section.driveId && form.isActive)
        .map((form) => ({
          id: form.id,
          driveId: form.driveId as string,
        }));
      return {
        id: section.id,
        name: section.name,
        parentId: section.parentId,
        documentCount: section.documents?.length || 0,
        documents:
          section.documents?.map((doc) => ({
            id: doc.id,
            title: doc.title,
            url: doc.url,
            driveId: doc.driveId,
            sectionId: doc.sectionId,
            createdAt: doc.createdAt,
          })) || [],
        children: section.children
          ? this.buildSectionTree(section.children, allForms)
          : [],
        driveId: section.driveId,
        forms,
        formsCount: forms.length,
      };
    });
    return returnSections;
  }

  private buildOptimizedSectionTree(
    rootSections: SectionWithRelations[],
    allSections: SectionWithRelations[],
  ): SectionTree[] {
    const buildChildren = (parentId: string): SectionTree[] => {
      const children = allSections.filter(
        (section) => section.parentId === parentId,
      );
      return children.map((section) => {
        return {
          id: section.id,
          name: section.name,
          parentId: section.parentId,
          documentCount: section.documents?.length || 0,
          documents:
            section.documents?.map((doc) => ({
              id: doc.id,
              title: doc.title,
              url: doc.url,
              driveId: doc.driveId,
              sectionId: doc.sectionId,
              createdAt: doc.createdAt,
            })) || [],
          children: buildChildren(section.id),
          forms: section.forms || [],
          formsCount: section.forms?.length || 0,
          driveId: section.driveId,
        };
      });
    };

    return rootSections.map((section) => {
      return {
        id: section.id,
        name: section.name,
        parentId: section.parentId,
        documentCount: section.documents?.length || 0,
        documents:
          section.documents?.map((doc) => ({
            id: doc.id,
            title: doc.title,
            url: doc.url,
            driveId: doc.driveId,
            sectionId: doc.sectionId,
            createdAt: doc.createdAt,
          })) || [],
        children: buildChildren(section.id),
        forms: section.forms || [],
        driveId: section.driveId,
        formsCount: forms.length,
      };
    });
  }
}
