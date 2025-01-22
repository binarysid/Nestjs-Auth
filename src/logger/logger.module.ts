import { Module } from '@nestjs/common';
import { LoggerProvider } from './logger.provider';
import { GlobalConfig } from 'src/global.config.service';

@Module({
  providers: [LoggerProvider, GlobalConfig],
})
export class LoggerModule {}
