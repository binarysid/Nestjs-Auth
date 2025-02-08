import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInUserDto } from 'src/user/dtos/signin-user.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { ThrottlerConfig, ThrottlerType } from 'src/enums/throttler-type.enum';
import { Throttle } from '@nestjs/throttler';
import { ActiveUser } from './decorators/active-user.decorator';
import { ActiveUserData } from './interfaces/active-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Throttle(ThrottlerConfig.getOptions(ThrottlerType.SHORT))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None) // this makes the endpoint public
  public async signIn(@Body() dto: SignInUserDto) {
    return await this.service.signIn(dto);
  }

  @Throttle(ThrottlerConfig.getOptions(ThrottlerType.SHORT))
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public async refreshToken(@Body() dto: RefreshTokenDto) {
    return await this.service.refreshToken(dto);
  }

  @Throttle(ThrottlerConfig.getOptions(ThrottlerType.SHORT))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  public async signout(@ActiveUser() user: ActiveUserData) {
    const userID = user['sub'];
    return await this.service.logout(userID);
  }
}
