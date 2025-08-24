import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { GoogleDriveService } from './google-drive.service';

@ApiTags('google-drive')
@Controller('google-drive')
export class GoogleDriveController {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get directory tree for a folder' })
  @ApiQuery({
    name: 'folderId',
    description: 'Google Drive folder ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Directory tree retrieved successfully',
  })
  listFiles(@Query('folderId') folderId: string) {
    return this.googleDriveService.getDirectoryTree(folderId);
  }

  @Get('folders')
  @ApiOperation({ summary: 'Get all folders from Google Drive' })
  @ApiResponse({
    status: 200,
    description: 'List of all folders',
  })
  async getFolders() {
    return this.googleDriveService.getAllFolders();
  }

  @Get('all-files')
  @ApiOperation({ summary: 'Get all files recursively from a folder' })
  @ApiQuery({
    name: 'folderId',
    description: 'Google Drive folder ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all files retrieved successfully',
  })
  async getAllFiles(@Query('folderId') folderId: string) {
    return this.googleDriveService.getAllFilesRecursive(folderId);
  }
}
