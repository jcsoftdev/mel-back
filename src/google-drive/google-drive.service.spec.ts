import { Test, TestingModule } from '@nestjs/testing';
import { GoogleDriveService } from './google-drive.service';
import { ConfigService } from '../config/config.service';
import { createMockConfigService } from '../common/test/test-utils';

describe('GoogleDriveService', () => {
  let service: GoogleDriveService;
  const mockConfigService = createMockConfigService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleDriveService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<GoogleDriveService>(GoogleDriveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
