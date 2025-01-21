import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  return {
    secret: process.env.JWT_SECRET,
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER,
    accessTokenTTL: parseInt(process.env.JWT_ACEES_TOKEN_TTL ?? '3600', 10),
    refreshTokenTTL: parseInt(process.env.JWT_REFRESH_TOKEN_TTL ?? '4200', 10),
  };
});
