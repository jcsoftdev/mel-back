import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleDriveModule } from './google-drive/google-drive.module';
import { ConfigModule } from './config/config.module';
import { FilesModule } from './files/files.module';
import { RolesModule } from './roles/roles.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { SectionsModule } from './sections/sections.module';

@Module({
  imports: [
    GoogleDriveModule,
    ConfigModule,
    FilesModule,
    RolesModule,
    PrismaModule,
    UsersModule,
    SectionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
