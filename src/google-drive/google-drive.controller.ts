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
    required: false,
    description: 'Google Drive folder ID',
    type: String,
    example: '1l8QTyWaaGiYgoSqRYP17WxPa5NBX_1d_',
  })
  @ApiResponse({
    status: 200,
    description: 'Directory tree retrieved successfully',
    example: {
      id: '1l8QTyWaaGiYgoSqRYP17WxPa5NBX_1d_',
      name: 'Root Folder',
      directories: [
        {
          id: '1abc123',
          name: 'Subfolder',
          directories: [],
          files: [],
        },
      ],
      files: [
        {
          id: '1def456',
          name: 'document.pdf',
          mimeType: 'application/pdf',
        },
      ],
    },
  })
  listFiles(@Query('folderId') folderId?: string) {
    return this.googleDriveService.getDirectoryTree(
      folderId ?? '1l8QTyWaaGiYgoSqRYP17WxPa5NBX_1d_',
    );
  }

  @Get('folders')
  @ApiOperation({ summary: 'Get all folders from Google Drive' })
  @ApiResponse({
    status: 200,
    description: 'List of all folders',
    example: [
      {
        id: '1abc123',
        name: 'Documents',
        mimeType: 'application/vnd.google-apps.folder',
      },
      {
        id: '1def456',
        name: 'Images',
        mimeType: 'application/vnd.google-apps.folder',
      },
    ],
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
    example: [
      {
        id: '1abc123',
        name: 'document.pdf',
        mimeType: 'application/pdf',
        parents: ['1parent123'],
      },
      {
        id: '1def456',
        name: 'image.jpg',
        mimeType: 'image/jpeg',
        parents: ['1parent123'],
      },
    ],
  })
  async getAllFiles(@Query('folderId') folderId: string) {
    return this.googleDriveService.getAllFilesRecursive(folderId);
  }
}
