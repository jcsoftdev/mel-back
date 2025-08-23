import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';
import { ConfigService } from 'src/config/config.service';

@Module({
  imports: [],
  controllers: [FilesController],
  providers: [FilesService, GoogleDriveService, ConfigService],
})
export class FilesModule {}
