import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Section } from './entities/section.entity';
import { SectionTree } from './types/section.types';
import { SectionTreeResponseDto } from './dto/section-tree-response.dto';

@ApiTags('sections')
@Controller('sections')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new section' })
  @ApiResponse({
    status: 201,
    description: 'Section created successfully',
    type: Section,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createSectionDto: CreateSectionDto) {
    return this.sectionsService.create(createSectionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sections' })
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: 'Filter by parent section ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Sections retrieved successfully',
    type: [Section],
  })
  findAll(
    @CurrentUser() user: { roles: string[] },
    @Query('parentId') parentId?: string,
  ) {
    if (user.roles.includes('admin')) {
      return this.sectionsService.findAll(parentId);
    }
    return this.sectionsService.findAllByUserRoles(user.roles, parentId);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get section tree' })
  @ApiResponse({
    status: 200,
    description: 'Section tree',
    type: [SectionTreeResponseDto],
  })
  getSectionTree(
    @CurrentUser() user: { roles: string[] },
  ): Promise<SectionTree[]> {
    if (user.roles.includes('admin')) {
      return this.sectionsService.getSectionTree();
    }
    return this.sectionsService.getSectionTreeByUserRoles(user.roles);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a section by ID' })
  @ApiParam({ name: 'id', description: 'Section ID' })
  @ApiResponse({
    status: 200,
    description: 'Section retrieved successfully',
    type: Section,
  })
  @ApiResponse({ status: 404, description: 'Section not found' })
  findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a section' })
  @ApiParam({ name: 'id', description: 'Section ID' })
  @ApiResponse({
    status: 200,
    description: 'Section updated successfully',
    type: Section,
  })
  @ApiResponse({ status: 404, description: 'Section not found' })
  update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.sectionsService.update(id, updateSectionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a section' })
  @ApiParam({ name: 'id', description: 'Section ID' })
  @ApiResponse({
    status: 200,
    description: 'Section deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Section not found' })
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(id);
  }
}
