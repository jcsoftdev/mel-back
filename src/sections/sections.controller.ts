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
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { SectionTree } from './types/section.types';

@ApiTags('sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new section' })
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
  getSectionTree(@Query('rootId') rootId?: string): Promise<SectionTree[]> {
    return this.sectionsService.getSectionTree(rootId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a section by ID' })
  @ApiParam({ name: 'id', description: 'Section ID' })
  findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a section' })
  @ApiParam({ name: 'id', description: 'Section ID' })
  update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.sectionsService.update(id, updateSectionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a section' })
  @ApiParam({ name: 'id', description: 'Section ID' })
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(id);
  }
}
