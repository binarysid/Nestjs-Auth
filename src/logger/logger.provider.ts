import { Injectable, LoggerService } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import * as path from 'path';
import { GlobalConfigProvider } from 'src/global.config/global.config.provider';
import * as StackParser from 'error-stack-parser';

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
    let callerInfo = '';
    try {
      const stack = StackParser.parse(new Error());
      const caller = stack.find(
        (frame) => frame.fileName && !frame.fileName.includes(__filename),
      );
      if (!caller) callerInfo = 'unknown';

      const fileName = path.basename(caller.fileName);
      const functionName = caller.functionName || 'anonymous';
      callerInfo = `${fileName}:${caller.lineNumber} [${functionName}]`;
    } catch (error) {
      callerInfo = 'unknown';
    }

    const formattedMessage = this.formatMessage(messages);
    if (this.config.isDev) {
      this.logger.error(formattedMessage);
    } else {
      const errorDetails = `[${callerInfo}] ${formattedMessage}`;
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

  debug(...messages: any[]): void {
    if (this.config.isDev) {
      const formattedMessage = this.formatMessage(messages);
      this.logger.debug(formattedMessage);
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
