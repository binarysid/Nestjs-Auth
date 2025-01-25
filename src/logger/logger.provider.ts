import { Injectable, LoggerService } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import * as path from 'path';
import { GlobalConfigProvider } from 'src/global.config/global.config.provider';

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
    this.debug(`Request URL: ${req.url}`);
  }

  log(message: any, context?: string) {
    if (this.config.isDev) {
      const formattedMessage = this.formatMessage(message, context);
      this.logger.log(formattedMessage);
    }
  }

  error(message: any, trace?: string, context?: string): void {
    if (this.config.isDev) {
      return;
    }
    const callerInfo = this.getCallerInfo();
    const formattedMessage = this.formatMessage(message, context, trace);
    const errorDetails = `[${callerInfo}] ${formattedMessage}`;
    this.logger.error(errorDetails);
    this.logToFile(errorDetails);
  }

  warn(message: any, context?: string): void {
    if (this.config.isDev) {
      const formattedMessage = this.formatMessage(message, context);
      this.logger.warn(formattedMessage);
    }
  }

  debug(message: any, context?: string): void {
    if (this.config.isDev) {
      const formattedMessage = this.formatMessage(message, context);
      this.logger.debug(formattedMessage);
    }
  }

  info(message: any, context?: string): void {
    if (this.config.isDev) {
      const formattedMessage = this.formatMessage(message, context);
      this.logger.log(formattedMessage);
    }
  }

  verbose(message: any, context?: string): void {
    if (this.config.isDev) {
      const formattedMessage = this.formatMessage(message, context);
      this.logger.trace(formattedMessage);
    }
  }

  private formatMessage(
    message: any,
    context?: string,
    trace?: string,
  ): string {
    return context
      ? `[${context}] ${message}${trace ? ` - Trace: ${trace}` : ''}`
      : `${message}${trace ? ` - Trace: ${trace}` : ''}` +
          ' ' +
          `[${this.request.url}]`;
  }

  private logToFile(message: string): void {
    // Placeholder for file logging logic
    console.log(`(Simulated) Writing to file: ${message}`);
  }

  private getCallerInfo(): string {
    const stack = new Error().stack || '';
    const stackLines = stack.split('\n');

    // Look for the first line that isn't part of this file
    const callerLine = stackLines.find((line) => !line.includes(__filename));
    if (!callerLine) return 'unknown';

    // Extract file name, line number, and function name
    const match = callerLine.match(/at (.+) \((.+):(\d+):(\d+)\)/);
    if (match) {
      const [, functionName, filePath, lineNumber] = match;
      const fileName = path.basename(filePath);
      return `${fileName}:${lineNumber} [${functionName}]`;
    }

    return 'unknown';
  }
}
