import { Injectable, LoggerService } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import * as path from 'path';
import { GlobalConfigProvider } from 'src/global.config/global.config.provider';
import * as StackParser from 'error-stack-parser';
import * as fs from 'fs';

@Injectable()
export class LoggerProvider implements LoggerService {
  private readonly logger;
  private request: Request;

  constructor(
    private readonly config: GlobalConfigProvider,
    private readonly loggerService: Logger,
  ) {
    this.logger = loggerService;
  }

  setRequest(req: Request) {
    this.request = req;
  }

  log(...messages: any[]) {
    if (this.config.isDev) {
      const formattedMessage = this.formatMessage(messages);
      this.logger.log(formattedMessage);
    }
  }

  error(...messages: any[]): void {
    const formattedMessage = this.formatMessage(messages);
    const errorDetails = `[${formattedMessage} | ${this.getCallerInfo()}`;
    if (this.config.isDev) {
      this.logger.error(errorDetails);
    } else {
      this.logger.error(errorDetails);
      this.logToFile(errorDetails);
    }
  }

  warn(...messages: any[]): void {
    if (this.config.isDev) {
      const formattedMessage = this.formatMessage(messages);
      this.logger.warn(formattedMessage);
    }
  }

  private getCallerInfo(): string {
    const originalPrepareStackTrace = Error.prepareStackTrace;
    try {
      const err = new Error();
      Error.prepareStackTrace = (_, structuredStackTrace) =>
        structuredStackTrace;
      const stack = err.stack as unknown as NodeJS.CallSite[];

      if (!stack || stack.length < 3) return 'Caller unknown';

      for (let i = 2; i < stack.length; i++) {
        const caller = stack[i];
        let fileName = caller.getFileName();
        const lineNumber = caller.getLineNumber();

        if (
          fileName &&
          !fileName.includes('logger.service.ts') &&
          !fileName.includes('node_modules')
        ) {
          // Ensure we are not referencing dist files
          if (fileName.endsWith('.js') && fileName.includes('dist')) {
            // Get the relative path from dist folder, remove `.js` extension and map it back to the source .ts file
            fileName = fileName
              .replace(/^.*dist/, 'src')
              .replace(/\.js$/, '.ts');
          }

          // Check if the file exists before proceeding
          if (fs.existsSync(fileName)) {
            const relativePath = path.relative(process.cwd(), fileName);
            return `${relativePath}:${lineNumber}`; // This format makes it clickable
          } else {
            return 'Caller unknown';
          }
        }
      }
      return 'Caller unknown';
    } finally {
      Error.prepareStackTrace = originalPrepareStackTrace;
    }
  }

  debug(...messages: any[]): void {
    if (this.config.isDev) {
      const formattedMessage = this.formatMessage(messages);
      this.logger.debug(`${formattedMessage} | ${this.getCallerInfo()}`);
    }
  }

  info(...messages: any[]): void {
    const formattedMessage = this.formatMessage(messages);
    this.logger.log(formattedMessage);
  }

  verbose(...messages: any[]): void {
    if (this.config.isDev) {
      const formattedMessage = this.formatMessage(messages);
      this.logger.trace(formattedMessage);
    }
  }

  private formatMessage(messages: any[]): string {
    const baseMessage = messages
      .map((msg) => (typeof msg === 'object' ? JSON.stringify(msg) : msg))
      .join(' ');

    return this.request ? `${baseMessage} [${this.request.url}]` : baseMessage;
  }

  private logToFile(message: string): void {}
}
