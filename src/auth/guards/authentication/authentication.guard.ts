import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { AUTH_TYPE_KEY } from 'src/auth/constants/auth.constants';
import { LoggerProvider } from 'src/logger/logger.provider';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.AccessToken;
  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  > = {
    [AuthType.AccessToken]: this.accessTokenGuard,
    [AuthType.None]: {
      canActivate: () => {
        this.logger.debug('None');
        return true;
      },
    },
  };

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly logger: LoggerProvider,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    this.logger.setRequest(request);
    this.logger.debug(
      'Authentication Guard activation started',
      'this is a global guard',
    );
    // Print authTypeGuardMap
    const authTypes = this.reflector.getAllAndOverride(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? [AuthenticationGuard.defaultAuthType];
    // Show what are authTypes

    const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();
    // printeGuards => Show that the user can pass an array in users controller as well

    // Declare the default error
    let error = new UnauthorizedException();

    for (const instance of guards) {
      // Decalre a new constant
      const canActivate = await Promise.resolve(
        // Here the AccessToken Guard Will be fired and check if user has permissions to acces
        // Later Multiple AuthTypes can be used even if one of them returns true
        // The user is Authorised to access the resource
        instance.canActivate(context),
      ).catch((err) => {
        this.logger.error('Error in canActivate', err);
        error = err;
      });

      // Display Can Activate
      if (canActivate) {
        this.logger.debug('User is authorised');
        return true;
      }
    }

    throw error;
  }
}
