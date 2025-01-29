import { Global, Module } from '@nestjs/common';
import { GlobalConfigProvider } from './global.config.provider';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [GlobalConfigProvider, ConfigService],
  exports: [GlobalConfigProvider],
})
export class GlobalConfigModule {}
