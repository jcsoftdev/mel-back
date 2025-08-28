import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GoogleDriveModule } from '../google-drive/google-drive.module';
import { SectionsService } from '../sections/sections.service';
import { DocumentsService } from '../documents/documents.service';
import { RoleAccessService } from '../common/services/role-access.service';

@Module({
  imports: [PrismaModule, GoogleDriveModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    SectionsService,
    DocumentsService,
    RoleAccessService,
  ],
})
export class UsersModule {}
