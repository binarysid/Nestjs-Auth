export enum ThrottlerType {
  DEFAULT = 'default',
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
}

export class ThrottlerConfig {
  static readonly options = {
    [ThrottlerType.DEFAULT]: { ttl: 60000, limit: 2 }, // Time in miliseconds (1 minute). this is default and use by each request. // Max 15 requests per ttl per IP
    [ThrottlerType.SHORT]: { ttl: 60000, limit: 5 },
    [ThrottlerType.MEDIUM]: { ttl: 60000, limit: 20 },
    [ThrottlerType.LONG]: { ttl: 60000, limit: 30 },
  };
}
