import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleDriveModule } from './google-drive/google-drive.module';
import { ConfigModule } from './config/config.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [GoogleDriveModule, ConfigModule, FilesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
