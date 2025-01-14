import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractRequestFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'my-api-secret',
        audience: 'localhost:3000/',
        issuer: 'localhost:3000/',
      });
    } catch (error) {}
    return true;
  }

  private extractRequestFromHeader(request: Request): string | undefined {
    // the token in the header comes like `Bearer jwt_token`. so we split by space
    const [_, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
