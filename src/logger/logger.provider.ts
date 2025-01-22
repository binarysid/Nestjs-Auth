import { Injectable, LoggerService } from '@nestjs/common';
import { GlobalConfig } from 'src/global.config.service';

@Injectable()
export class LoggerProvider implements LoggerService {
  constructor(private readonly config: GlobalConfig) {}

  log(message: string, context?: string) {
    if (this.config.isDev) {
      const formattedMessage = `[LOG] [${context || 'App'}] ${message}`;
      console.log(formattedMessage);
    } else {
      this.logToFile(message);
    }
  }

  error(message: string, trace?: string, context?: string) {
    const formattedMessage = `[ERROR] ${new Date().toISOString()} [${context || 'App'}] ${message}`;

    if (trace) {
      console.error(trace);
    }

    console.error(formattedMessage);
    this.logToFile(formattedMessage);
  }

  private logToFile(message: string) {
    // Example logic to log to a file in production
    console.log(`(Simulated) Writing to file: ${message}`);
  }

  debug?(message: string, context?: string) {
    if (this.config.isDev) {
      console.debug(
        `[DEBUG] ${new Date().toISOString()} [${context || 'App'}] ${message}`,
      );
    }
  }

  verbose?(message: string, context?: string) {
    if (this.config.isDev) {
      console.info(
        `[VERBOSE] ${new Date().toISOString()} [${context || 'App'}] ${message}`,
      );
    }
  }

  warn(message: any, ...optionalParams: any[]) {
    if (this.config.isDev) {
      console.warn(message, optionalParams);
    }
  }
}
