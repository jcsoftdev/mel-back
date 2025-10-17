import { Test, TestingModule } from '@nestjs/testing';
import { GoogleDriveController } from './google-drive.controller';
import { GoogleDriveService } from './google-drive.service';

describe('GoogleDriveController', () => {
  let controller: GoogleDriveController;
  const mockGoogleDriveService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
    getFileAsBase64: jest.fn(),
    getDirectoryTree: jest.fn(),
    createFolder: jest.fn(),
    getMediaStream: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleDriveController],
      providers: [
        {
          provide: GoogleDriveService,
          useValue: mockGoogleDriveService,
        },
      ],
    }).compile();

    controller = module.get<GoogleDriveController>(GoogleDriveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
