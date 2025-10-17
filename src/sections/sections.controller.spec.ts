import { Test, TestingModule } from '@nestjs/testing';
import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';

describe('SectionsController', () => {
  let controller: SectionsController;
  const mockSectionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getTree: jest.fn(),
    moveSection: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectionsController],
      providers: [
        {
          provide: SectionsService,
          useValue: mockSectionsService,
        },
      ],
    }).compile();

    controller = module.get<SectionsController>(SectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
