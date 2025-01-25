import { Global, Module } from '@nestjs/common';
import { GlobalConfigProvider } from './global.config.provider';

@Global()
@Module({
  providers: [GlobalConfigProvider],
  exports: [GlobalConfigProvider],
})
export class GlobalConfigModule {}
