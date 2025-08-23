import { Controller, Get, Query } from '@nestjs/common';
import { GoogleDriveService } from './google-drive.service';

@Controller('google-drive')
export class GoogleDriveController {
  constructor(private readonly googleDriveService: GoogleDriveService) {}
  @Get('list')
  listFiles(@Query('folderId') folderId: string) {
    return this.googleDriveService.getDirectoryTree(folderId);
  }

  @Get('folders')
  async getFolders() {
    return this.googleDriveService.getAllFolders();
  }

  @Get('all-files')
  async getAllFiles(@Query('folderId') folderId: string) {
    return this.googleDriveService.getAllFilesRecursive(folderId);
  }
}
