import { Injectable, OnModuleInit, Scope } from '@nestjs/common';
import { Environment } from 'src/Environment.enum';
import { LoggerProvider } from 'src/logger/logger.provider';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GlobalConfigProvider implements OnModuleInit {
  private readonly environment: Environment;
  private requestUrl: string;
  private static readonly ENV = process.env.NODE_ENV || Environment.Development;

  constructor(
    private readonly logger: LoggerProvider,
    private readonly configService: ConfigService,
  ) {
    const env = process.env.NODE_ENV as Environment;
    this.environment = Object.values(Environment).includes(env)
      ? env
      : Environment.Development;
  }

  onModuleInit() {
    this.logger.info(`Running in ${this.environment} mode`);
  }

  public get isDev(): boolean {
    return this.environment === Environment.Development;
  }

  get isProd(): boolean {
    return this.environment === Environment.Production;
  }

  get isTest(): boolean {
    return this.environment === Environment.Testing;
  }

  get environmentName(): Environment {
    return this.environment;
  }

  get dbURI(): string {
    if (this.isProd)
      return `mongodb+srv://${this.configService.get('DB_USER')}:${this.configService.get('DB_PASSWORD')}@${this.configService.get('DB_HOST')}/${this.configService.get('DB_NAME')}}`;
    return 'mongodb://localhost:27017/';
  }

  get logLevel(): string {
    return this.isDev ? 'debug' : 'info';
  }

  static get envFilePath(): string {
    return `.env.${GlobalConfigProvider.ENV}`;
  }

  get<T = string>(key: string, defaultValue?: T): T {
    return (process.env[key] as T) || defaultValue;
  }

  setRequestUrl(url: string) {
    this.requestUrl = url;
  }

  getRequestUrl(): string {
    return this.requestUrl;
  }
}
