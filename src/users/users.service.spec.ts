import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleDriveService } from '../google-drive/google-drive.service';
import { FormsService } from '../forms/services/forms.service';
import {
  createMockPrismaService,
  createMockGoogleDriveService,
} from '../common/test/test-utils';

describe('UsersService', () => {
  let service: UsersService;
  const mockPrismaService = createMockPrismaService();
  const mockGoogleDriveService = createMockGoogleDriveService();
  const mockFormsService = {
    create: jest.fn().mockResolvedValue({}),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: GoogleDriveService,
          useValue: mockGoogleDriveService,
        },
        {
          provide: FormsService,
          useValue: mockFormsService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
