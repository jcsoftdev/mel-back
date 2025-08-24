import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AccessLevel } from '@prisma/client';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of all roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Role found' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  @Get(':id/sections')
  @ApiOperation({ summary: 'Get section permissions for a role' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Section permissions retrieved' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  getSectionPermissions(@Param('id') id: string) {
    return this.rolesService.getSectionPermissions(id);
  }

  @Post(':id/sections')
  @ApiOperation({ summary: 'Grant multiple section access to role' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
  @ApiBody({
    description: 'Array of section IDs to grant access to',
    schema: {
      type: 'object',
      properties: {
        sectionIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of section IDs',
        },
      },
      required: ['sectionIds'],
    },
  })
  @ApiResponse({ status: 201, description: 'Section access granted' })
  @ApiResponse({ status: 404, description: 'Role or sections not found' })
  async addSectionsAccess(
    @Param('id') roleId: string,
    @Body() body: { sectionIds: string[] },
  ) {
    return await this.rolesService.addSectionsAccess(roleId, body.sectionIds);
  }

  @Post(':id/sections/:sectionId')
  @ApiOperation({ summary: 'Grant section access to role' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
  @ApiParam({ name: 'sectionId', description: 'Section ID', type: 'string' })
  @ApiResponse({ status: 201, description: 'Section access granted' })
  @ApiResponse({ status: 404, description: 'Role or section not found' })
  async addSectionAccess(
    @Param('id') roleId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return await this.rolesService.addSectionAccess(roleId, sectionId);
  }

  @Delete(':id/sections/:sectionId')
  @ApiOperation({ summary: 'Revoke section access from role' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
  @ApiParam({ name: 'sectionId', description: 'Section ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Section access revoked' })
  @ApiResponse({ status: 404, description: 'Role access not found' })
  removeSectionAccess(
    @Param('id') roleId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.rolesService.removeSectionAccess(roleId, sectionId);
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'Get document permissions for a role' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Document permissions retrieved' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  getDocumentPermissions(@Param('id') id: string) {
    return this.rolesService.getDocumentPermissions(id);
  }

  @Post(':id/documents/:documentId')
  @ApiOperation({ summary: 'Grant document access to role' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
  @ApiParam({ name: 'documentId', description: 'Document ID', type: 'string' })
  @ApiQuery({
    name: 'level',
    enum: AccessLevel,
    required: false,
    description: 'Access level (default: read)',
  })
  @ApiResponse({ status: 201, description: 'Document access granted' })
  @ApiResponse({ status: 404, description: 'Role or document not found' })
  addDocumentAccess(
    @Param('id') roleId: string,
    @Param('documentId') documentId: string,
    @Query('level') level?: AccessLevel,
  ) {
    return this.rolesService.addDocumentAccess(roleId, documentId, level);
  }

  @Delete(':id/documents/:documentId')
  @ApiOperation({ summary: 'Revoke document access from role' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
  @ApiParam({ name: 'documentId', description: 'Document ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Document access revoked' })
  @ApiResponse({ status: 404, description: 'Role access not found' })
  removeDocumentAccess(
    @Param('id') roleId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.rolesService.removeDocumentAccess(roleId, documentId);
  }
}
