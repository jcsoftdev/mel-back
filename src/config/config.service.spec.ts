import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { ConfigService as NestConfigService } from '@nestjs/config';

describe('ConfigService', () => {
  let service: ConfigService;
  const mockNestConfigService = {
    get: jest.fn().mockReturnValue('mock-value'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        {
          provide: NestConfigService,
          useValue: mockNestConfigService,
        },
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
