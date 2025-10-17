import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { GoogleDriveService } from '../google-drive/google-drive.service';
import { createMockGoogleDriveService } from '../common/test/test-utils';

describe('FilesService', () => {
  let service: FilesService;
  const mockGoogleDriveService = createMockGoogleDriveService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: GoogleDriveService,
          useValue: mockGoogleDriveService,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
