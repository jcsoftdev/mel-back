import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PatchUserRolesDto } from './dto/patch-user-roles.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { roleIds, ...userData } = createUserDto;
      return await this.prisma.user.create({
        data: {
          ...userData,
          ...(roleIds &&
            roleIds.length > 0 && {
              roles: {
                connect: roleIds.map((id) => ({ id })),
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
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
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
}
