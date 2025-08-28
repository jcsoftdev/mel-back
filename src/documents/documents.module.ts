import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RoleAccessService } from '../common/services/role-access.service';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, RoleAccessService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
