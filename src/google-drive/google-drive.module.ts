import { Module } from '@nestjs/common';
import { GoogleDriveService } from './google-drive.service';
import { GoogleDriveController } from './google-drive.controller';
import { ConfigService } from 'src/config/config.service';

@Module({
  controllers: [GoogleDriveController],
  providers: [GoogleDriveService, ConfigService],
})
export class GoogleDriveModule {}
