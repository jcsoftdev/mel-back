import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    return this.prisma.role.create({
      data: {
        name: createRoleDto.name,
      },
    });
  }

  async findAll() {
    return this.prisma.role.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.role.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    return this.prisma.role.update({
      where: {
        id,
      },
      data: {
        name: updateRoleDto.name,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.role.delete({
      where: {
        id,
      },
    });
  }

  // Section permission methods
  async getSectionPermissions(roleId: string) {
    return await this.prisma.roleSectionAccess.findMany({
      where: {
        roleId,
      },
      include: {
        section: true,
      },
    });
  }

  async addSectionsAccess(roleId: string, sectionIds: string[]) {
    const operations = sectionIds.map((sectionId) =>
      this.prisma.roleSectionAccess.upsert({
        where: {
          roleId_sectionId: {
            roleId,
            sectionId,
          },
        },
        update: {},
        create: {
          roleId,
          sectionId,
        },
      }),
    );

    return await Promise.all(operations);
  }

  async addSectionAccess(roleId: string, sectionId: string) {
    return await this.prisma.roleSectionAccess.upsert({
      where: {
        roleId_sectionId: {
          roleId,
          sectionId,
        },
      },
      update: {},
      create: {
        roleId,
        sectionId,
      },
    });
  }

  async removeSectionAccess(roleId: string, sectionId: string) {
    return await this.prisma.roleSectionAccess.delete({
      where: {
        roleId_sectionId: {
          roleId,
          sectionId,
        },
      },
    });
  }

  // Document permission methods
  async getDocumentPermissions(roleId: string) {
    return await this.prisma.roleDocumentAccess.findMany({
      where: {
        roleId,
      },
      include: {
        document: true,
      },
    });
  }

  async addDocumentAccess(roleId: string, documentId: string) {
    return await this.prisma.roleDocumentAccess.upsert({
      where: {
        roleId_documentId: {
          roleId,
          documentId,
        },
      },
      create: {
        roleId,
        documentId,
      },
      update: {},
    });
  }

  async removeDocumentAccess(roleId: string, documentId: string) {
    return await this.prisma.roleDocumentAccess.delete({
      where: {
        roleId_documentId: {
          roleId,
          documentId,
        },
      },
    });
  }
}
