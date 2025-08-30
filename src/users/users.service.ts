import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PatchUserRolesDto } from './dto/patch-user-roles.dto';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleDriveService } from '../google-drive/google-drive.service';
import { GoogleDriveDirectoryDto } from '../google-drive/google-drive.dto';
import { FormsService } from '../forms/services/forms.service';
import { CreateFormDto } from '../forms/dto/create-form.dto';
import { hashPassword } from '../common/utils/password.util';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private googleDriveService: GoogleDriveService,
    private formsService: FormsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { roleIds, password, ...userData } = createUserDto;

      const hashedPassword = await hashPassword(password);

      // Validate that all role IDs exist if provided
      if (roleIds && roleIds.length > 0) {
        const existingRoles = await this.prisma.role.findMany({
          where: { id: { in: roleIds } },
          select: { id: true },
        });

        const existingRoleIds = existingRoles.map((role) => role.id);
        const invalidRoleIds = roleIds.filter(
          (roleId) => !existingRoleIds.includes(roleId),
        );

        if (invalidRoleIds.length > 0) {
          throw new Error(`Invalid role IDs: ${invalidRoleIds.join(', ')}`);
        }
      }

      return await this.prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          ...(roleIds &&
            roleIds.length > 0 && {
              roles: {
                create: roleIds.map((roleId) => ({
                  roleId,
                })),
              },
            }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create user: ${errorMessage}`);
    }
  }

  async findAll() {
    try {
      return await this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch users: ${errorMessage}`);
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch user: ${errorMessage}`);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const updateData = { ...updateUserDto };

      // Hash password if it's being updated
      if (updateUserDto.password) {
        updateData.password = await hashPassword(updateUserDto.password);
      }

      return await this.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update user: ${errorMessage}`);
    }
  }

  async remove(id: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      await this.prisma.user.delete({ where: { id } });
      return { message: `User with ID ${id} has been successfully deleted` };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete user: ${errorMessage}`);
    }
  }

  async patchRoles(id: string, patchUserRolesDto: PatchUserRolesDto) {
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Validate that all role IDs exist
      const { roleIds } = patchUserRolesDto;
      if (roleIds && roleIds.length > 0) {
        const existingRoles = await this.prisma.role.findMany({
          where: { id: { in: roleIds } },
          select: { id: true },
        });

        const existingRoleIds = existingRoles.map((role) => role.id);
        const invalidRoleIds = roleIds.filter(
          (roleId) => !existingRoleIds.includes(roleId),
        );

        if (invalidRoleIds.length > 0) {
          throw new Error(`Invalid role IDs: ${invalidRoleIds.join(', ')}`);
        }
      }

      // Delete existing user roles first
      await this.prisma.userRole.deleteMany({
        where: { userId: id },
      });

      // Create new user roles if any provided
      if (roleIds && roleIds.length > 0) {
        await this.prisma.userRole.createMany({
          data: roleIds.map((roleId) => ({
            userId: id,
            roleId,
          })),
        });
      }

      // Return updated user with roles
      return await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to patch user roles: ${errorMessage}`);
    }
  }

  async sync(folderId: string = '1l8QTyWaaGiYgoSqRYP17WxPa5NBX_1d_') {
    try {
      // Get the directory tree from Google Drive
      const directoryTree =
        await this.googleDriveService.getDirectoryTree(folderId);

      // Sync the tree recursively
      await this.syncDirectoryTree(directoryTree, null);

      return { message: 'Sync completed successfully' };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to sync with Google Drive: ${errorMessage}`);
    }
  }

  private async syncDirectoryTree(
    item: GoogleDriveDirectoryDto,
    parentSectionId: string | null,
  ): Promise<void> {
    // `item` now represents a folder node with optional `directories` and `files`.
    // Upsert the folder as a Section and then process its children.
    console.log({ item, parentSectionId });

    try {
      const section = await this.prisma.section.upsert({
        where: { driveId: item.id },
        update: {
          name: item.name,
          parentId: parentSectionId || undefined,
        },
        create: {
          driveId: item.id,
          name: item.name,
          parentId: parentSectionId || undefined,
        },
        select: { id: true, name: true },
      });

      console.log(`Synced folder: ${item.name}`);

      // If the folder is named like `form_<name>`, create a corresponding form
      try {
        const formMatch = item.name.match(/^form_(.+)$/i);
        console.log(
          `Found form folder: ${item.name}: ${formMatch ? 'Matched' : 'Not Matched'}`,
        );
        if (formMatch) {
          const rawTitle = formMatch[1].trim();
          const title = rawTitle.replace(/[_-]+/g, ' ').trim();

          // Avoid creating duplicate forms for the same Drive folder
          const existingForm = await this.prisma.form.findUnique({
            where: { driveId: item.id },
            select: { id: true },
          });

          if (!existingForm) {
            const createFormDto: CreateFormDto = {
              title,
              description: `Form created from Drive folder ${item.name}`,
              driveId: item.id,
              fields: [],
              isActive: false,
            } as CreateFormDto;

            try {
              await this.formsService.create(createFormDto);
            } catch (createErr) {
              console.error(
                `Failed to create form for folder ${item.name}:`,
                createErr,
              );
            }
          }
        }
      } catch (err) {
        console.error(
          'Error while attempting to create form from folder name:',
          err,
        );
      }

      // Upsert files contained directly in this folder (e.g., PDFs)
      if (Array.isArray(item.files) && item.files.length > 0) {
        await Promise.all(
          item.files.map(async (file) => {
            // locally type the file to avoid unsafe `any` access
            const f = file as {
              id?: string;
              name?: string;
              mimeType?: string;
              webContentLink?: string;
            };

            try {
              if (!f.id || !f.name) return;

              if (f.mimeType === 'application/pdf') {
                await this.prisma.document.upsert({
                  where: { driveId: f.id },
                  update: {
                    title: f.name,
                    url: (f.webContentLink as string) || undefined,
                    sectionId: section.id,
                  },
                  create: {
                    driveId: f.id,
                    title: f.name,
                    url:
                      (f.webContentLink as string) ||
                      `https://drive.google.com/file/d/${f.id}/view`,
                    sectionId: section.id,
                  },
                });
              }
            } catch (error: unknown) {
              console.error(`Error syncing document ${f.name}:`, error);
              throw error;
            }
          }),
        );
      }

      // Recurse into child directories
      if (Array.isArray(item.directories) && item.directories.length > 0) {
        await Promise.all(
          item.directories.map((child) =>
            this.syncDirectoryTree(child, section.id),
          ),
        );
      }
    } catch (error: unknown) {
      console.error(`Error syncing folder ${item.name}:`, error);
      throw error;
    }
  }
}
