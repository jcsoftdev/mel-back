import { Test, TestingModule } from '@nestjs/testing';
import { SectionsService } from './sections.service';
import { PrismaService } from '../prisma/prisma.service';
import { RoleAccessService } from '../common/services/role-access.service';
import {
  createMockPrismaService,
  createMockRoleAccessService,
} from '../common/test/test-utils';

describe('SectionsService', () => {
  let service: SectionsService;
  const mockPrismaService = createMockPrismaService();
  const mockRoleAccessService = createMockRoleAccessService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: RoleAccessService,
          useValue: mockRoleAccessService,
        },
      ],
    }).compile();

    service = module.get<SectionsService>(SectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
