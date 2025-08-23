import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { Configuration } from './configuration';

@Injectable()
export class ConfigService {
  constructor(private readonly config: NestConfigService) {}

  get port(): Configuration['port'] {
    return this.config.get<Configuration['port']>('port')!;
  }

  get googleDrive(): Configuration['googleDrive'] {
    return this.config.get<Configuration['googleDrive']>('googleDrive')!;
  }

  get(key: string): string {
    return this.config.get<string>(`${key}`)!;
  }
}
