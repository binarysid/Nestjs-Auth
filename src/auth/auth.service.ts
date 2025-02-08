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
import { RefresehTokenProvider } from './providers/refreseh-token.provider';
import { LoggerProvider } from 'src/logger/logger.provider';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    private readonly hashingProvider: HashingProvider,

    private readonly tokenProvider: GenerateTokenProvider,

    private readonly refresehTokenProvider: RefresehTokenProvider,

    private readonly logger: LoggerProvider,
  ) {}

  public async signIn(dto: SignInUserDto) {
    const user = await this.userService.findUserby(dto.email);
    if (!user) {
      throw new UnauthorizedException('User does not exists');
    }

    let isEqual = false;
    this.logger.log('found user: ', user);

    try {
      // const hashedPass = await this.hashingProvider.hash(dto.password);
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
    await this.userService.updateRefreshToken(user._id, refreshToken);
    this.logger.debug('tokens udpated to db');
    return { accessToken, refreshToken };
  }

  public async refreshToken(dto: RefreshTokenDto) {
    return await this.refresehTokenProvider.refreshToken(dto);
  }

  public async logout(id: string) {
    await this.userService.updateRefreshToken(id, null);
  }
}
