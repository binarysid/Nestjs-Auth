import { Injectable } from '@nestjs/common';
import { Environment } from './Environment.enum';

@Injectable()
export class GlobalConfig {
  private readonly environment: Environment;

  constructor() {
    const env = process.env.NODE_ENV as Environment;
    this.environment = Object.values(Environment).includes(env)
      ? env
      : Environment.Development;
  }

  get isDev(): boolean {
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
}
