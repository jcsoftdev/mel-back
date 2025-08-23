import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import configuration from './configuration';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [configuration],
    }),
  ],
  controllers: [],
  providers: [ConfigService],
})
export class ConfigModule {}
