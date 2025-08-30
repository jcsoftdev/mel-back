import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GoogleDriveModule } from '../google-drive/google-drive.module';
import { FormsModule } from '../forms/forms.module';
import { SectionsService } from '../sections/sections.service';
import { DocumentsService } from '../documents/documents.service';
import { RoleAccessService } from '../common/services/role-access.service';

@Module({
  imports: [PrismaModule, GoogleDriveModule, FormsModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    SectionsService,
    DocumentsService,
    RoleAccessService,
  ],
})
export class UsersModule {}
