import {
  Injectable,
  forwardRef,
  Inject,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInUserDto } from 'src/user/dtos/signin-user.dto';
import { UserService } from 'src/user/user.service';
import { HashingProvider } from './providers/hashing.provider';
import { GenerateTokenProvider } from './providers/generate-token.provider';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { LoggerProvider } from 'src/logger/logger.provider';
import { User } from 'src/user/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly hashingProvider: HashingProvider,
    private readonly tokenProvider: GenerateTokenProvider,
    private readonly logger: LoggerProvider,
  ) {}

  public async signIn(dto: SignInUserDto) {
    const user: User = await this.userService.findUserby(dto.email);
    if (!user) {
      throw new UnauthorizedException('User does not exists');
    }

    // if (!user.isVerified) {
    //   this.logger.error('User is not verified');
    //   throw new UnauthorizedException('User is not verified');
    // }

    const hasActiveSession = await this.userService.hasSession(user.id);
    if (hasActiveSession) {
      this.logger.debug('User already logged in');
      throw new UnauthorizedException(
        'User already logged in. Please logout from any device that you are singed in',
      );
    }

    let isEqual = false;
    this.logger.log('found user: ', user);

    try {
      isEqual = await this.hashingProvider.compare(dto.password, user.password);
    } catch (error) {
      this.logger.error('Could not compare password', error);
      throw new RequestTimeoutException(error, {
        description: 'Could not compare password',
      });
    }

    if (!isEqual) {
      this.logger.error('password does not match');
      throw new UnauthorizedException('Incorrect password');
    }

    this.logger.debug('logged in success');
    const { accessToken, refreshToken } =
      await this.tokenProvider.generateTokens(user);
    this.logger.debug('tokens generated');
    const tokenDto: RefreshTokenDto = {
      refreshToken: refreshToken,
      deviceID: null,
      userAgent: null,
    };
    await this.userService.updateSession(user.id, tokenDto);
    this.logger.debug('signin process completed');
    return { accessToken, refreshToken };
  }

  public async refreshToken(dto: RefreshTokenDto) {
    return await this.userService.refreshToken(dto);
  }

  public async logout(dto: RefreshTokenDto) {
    return await this.userService.removeSession(dto);
  }
}
