import { Injectable, OnModuleInit, Scope } from '@nestjs/common';
import { ThrottlerType } from 'src/enums/throttler-type.enum';
import { Environment } from 'src/Environment.enum';

@Injectable()
export class GlobalConfigProvider implements OnModuleInit {
  private readonly environment: Environment;
  private requestUrl: string;
  private static readonly ENV = process.env.NODE_ENV || Environment.Development;

  constructor() {
    const env = process.env.NODE_ENV as Environment;
    this.environment = Object.values(Environment).includes(env)
      ? env
      : Environment.Development;
  }

  onModuleInit() {
    console.log(`Running in ${this.environment} mode`);
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
    return `mongodb+srv://${this.get('DB_USER')}:${this.get('DB_PASSWORD')}@${this.get('DB_HOST')}/${this.get('DB_NAME')}`;
    // return 'mongodb://mongodb:27017/tts-user'; // for docker
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
