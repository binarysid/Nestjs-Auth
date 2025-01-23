import { Injectable, LoggerService } from '@nestjs/common';
import { GlobalConfig } from 'src/global.config.service';

@Injectable()
export class LoggerProvider implements LoggerService {
  constructor(private readonly config: GlobalConfig) {}

  private getCallerInfo(): string {
    // Create an Error object to capture the stack trace
    const error = new Error();
    const stackLines = error.stack?.split('\n') || [];

    // The third line in the stack typically contains the caller information
    const callerLine = stackLines[3];

    if (callerLine) {
      // Extract the file, function, and line/column details
      const match =
        callerLine.match(/at\s+(.*?)\s+\((.*):(\d+):(\d+)\)/) ||
        callerLine.match(/at\s+(.*):(\d+):(\d+)/);
      if (match) {
        const [_, functionName, filePath, line, column] = match;
        const fileName = filePath?.split('/').pop(); // Get only the file name
        return `${fileName}:${line}:${column} [${functionName || 'anonymous'}]`;
      }
    }
    return 'unknown';
  }

  private formatMessage(message: string): string {
    const callerInfo = this.getCallerInfo();
    return `[${callerInfo}] ${message}`;
  }

  log(message: string, context?: string) {
    if (this.config.isDev) {
      const formattedMessage = `[LOG] [${context || 'App'}] ${message}`;
      const logMessage = this.formatMessage(formattedMessage);
      console.log(logMessage);
    } else {
      this.logToFile(message);
    }
  }

  error(message: string, trace?: string, context?: string) {
    const formattedMessage = `[ERROR] ${new Date().toISOString()} [${context || 'App'}] ${message}`;

    if (trace) {
      console.error(trace);
    }
    const logMessage = this.formatMessage(formattedMessage);
    console.error(logMessage);
    this.logToFile(logMessage);
  }

  private logToFile(message: string) {
    // Example logic to log to a file in production
    // console.log(`(Simulated) Writing to file: ${message}`);
  }

  debug?(message: string, context?: string) {
    if (this.config.isDev) {
      const formattedMessage = `[DEBUG] [${context || 'App'}] ${message}`;
      const logMessage = this.formatMessage(formattedMessage);
      console.debug(logMessage);
    }
  }

  verbose?(message: string, context?: string) {
    if (this.config.isDev) {
      const formattedMessage = `[VERBOSE] ${new Date().toISOString()} [${context || 'App'}] ${message}`;
      const logMessage = this.formatMessage(formattedMessage);
      console.info(logMessage);
    }
  }

  warn(message: any, ...optionalParams: any[]) {
    if (this.config.isDev) {
      const formattedMessage = `[WARN] ${message}`;
      const logMessage = this.formatMessage(formattedMessage);
      console.warn(message, optionalParams);
    }
  }
}
