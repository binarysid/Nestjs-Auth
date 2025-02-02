export enum ThrottlerType {
  DEFAULT = 'default',
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
}

export class ThrottlerConfig {
  static readonly options = {
    [ThrottlerType.DEFAULT]: { ttl: 20000, limit: 4 }, // Time in miliseconds (1 minute). this is default and use by each request. // Max 15 requests per ttl per IP
    [ThrottlerType.SHORT]: { ttl: 20000, limit: 8 },
    [ThrottlerType.MEDIUM]: { ttl: 20000, limit: 16 },
    [ThrottlerType.LONG]: { ttl: 20000, limit: 32 },
  };

  // Function to get options based on the type (useful for reusability)
  static getOptions(type: ThrottlerType) {
    const opt = {
      [type]: {
        ttl: this.options[type].ttl,
        limit: this.options[type].limit,
      },
    };
    return opt;
  }
}
