import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import jwtConfig from 'src/auth/config/jwt.config';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';
import { LoggerProvider } from 'src/logger/logger.provider';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly logger: LoggerProvider,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractRequestFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );
      this.logger.debug('Payload: ', payload);
      request[REQUEST_USER_KEY] = payload;
    } catch {
      this.logger.error('Could not verify token');
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractRequestFromHeader(request: Request): string | undefined {
    // the token in the header comes like `Bearer jwt_token`. so we split by space
    const [_, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
