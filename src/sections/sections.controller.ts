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
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { SectionTree } from './types/section.types';
import { Section } from './entities/section.entity';
import { SectionTreeResponseDto } from './dto/section-tree-response.dto';

@ApiTags('sections')
@Controller('sections')
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
  findAll(@Query('parentId') parentId?: string) {
    return this.sectionsService.findAll(parentId);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get section tree hierarchy' })
  @ApiQuery({
    name: 'rootId',
    required: false,
    description: 'Root section ID for tree',
  })
  @ApiResponse({
    status: 200,
    description: 'Section tree retrieved successfully',
    type: [SectionTreeResponseDto],
  })
  getSectionTree(@Query('rootId') rootId?: string): Promise<SectionTree[]> {
    return this.sectionsService.getSectionTree(rootId);
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
