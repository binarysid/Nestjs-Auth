import { Injectable, Scope } from '@nestjs/common';
import { Environment } from 'src/Environment.enum';

@Injectable()
export class GlobalConfigProvider {
  private readonly environment: Environment;
  private requestUrl: string;

  constructor() {
    const env = process.env.NODE_ENV as Environment;
    this.environment = Object.values(Environment).includes(env)
      ? env
      : Environment.Development;
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
