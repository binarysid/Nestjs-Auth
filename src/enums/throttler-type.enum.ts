export enum ThrottlerType {
  DEFAULT = 'default',
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
}

export class ThrottlerConfig {
  static readonly options = {
    [ThrottlerType.DEFAULT]: { ttl: 60000, limit: 8 }, // Time in miliseconds (1 minute). this is default and use by each request. // Max 8 requests per ttl per IP
    [ThrottlerType.SHORT]: { ttl: 60000, limit: 5 },
    [ThrottlerType.MEDIUM]: { ttl: 60000, limit: 15 },
    [ThrottlerType.LONG]: { ttl: 60000, limit: 25 },
  };

  // Function to get options based on the type (useful for reusability)
  static getOptions(type: ThrottlerType) {
    const opt = {
      default: {
        ttl: this.options[type].ttl,
        limit: this.options[type].limit,
      },
    };
    return opt;
  }
}
