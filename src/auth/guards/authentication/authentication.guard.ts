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
import { Observable } from 'rxjs';

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
        console.log('None');
        return true;
      },
    },
  };

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('AuthenticationGuard');
    // Print authTypeGuardMap
    const authTypes = this.reflector.getAllAndOverride(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? [AuthenticationGuard.defaultAuthType];
    // Show what are authTypes
    // console.log(authTypes);

    const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();
    // printeGuards => Show that the user can pass an array in users controller as well
    // console.log(guards);

    // Declare the default error
    let error = new UnauthorizedException();

    for (const instance of guards) {
      // print each instance
      // console.log(instance);
      // Decalre a new constant
      const canActivate = await Promise.resolve(
        // Here the AccessToken Guard Will be fired and check if user has permissions to acces
        // Later Multiple AuthTypes can be used even if one of them returns true
        // The user is Authorised to access the resource
        instance.canActivate(context),
      ).catch((err) => {
        error = err;
      });

      // Display Can Activate
      // console.log(canActivate);
      if (canActivate) {
        return true;
      }
    }

    throw error;
  }
}
