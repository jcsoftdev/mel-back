import { Module } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RoleAccessService } from '../common/services/role-access.service';

@Module({
  imports: [PrismaModule],
  controllers: [SectionsController],
  providers: [SectionsService, RoleAccessService],
  exports: [SectionsService],
})
export class SectionsModule {}
