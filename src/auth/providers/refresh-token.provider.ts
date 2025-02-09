import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { GenerateTokenProvider } from './generate-token.provider';
import { ActiveUserData } from '../interfaces/active-user.interface';
import { LoggerProvider } from 'src/logger/logger.provider';
import { HashingProvider } from './hashing.provider';

@Injectable()
export class RefresehTokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly tokenProvider: GenerateTokenProvider,
    private readonly logger: LoggerProvider,
    private readonly hashingProvider: HashingProvider,
  ) {}

  public async refreshToken(dto: RefreshTokenDto) {
    try {
      const { sub } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'>
      >(dto.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });
      this.logger.debug('refresh token verified');

      const user = await this.userService.findUserbyID(sub);
      this.logger.debug('found user id: ', sub);
      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }
      this.logger.debug('found user: ', user);

      const userSession = await this.userService.findSessionById(sub);
      if (!userSession) {
        this.logger.error('User session not found');
        throw new NotFoundException('User session not found');
      }
      this.logger.debug('found user session: ', userSession);

      if (!userSession.hashedRefreshToken) {
        this.logger.error('Not logged in. please log in');
        throw new UnauthorizedException('Not logged in. please log in');
      }

      const isEqual = await this.hashingProvider.compare(
        dto.refreshToken,
        userSession.hashedRefreshToken,
      );
      if (!isEqual) {
        this.logger.error('Refresh token does not match');
        throw new UnauthorizedException('Refresh token does not match');
      }

      this.logger.debug('refresh tokens matched. Ready to generate new tokens');

      const { accessToken, refreshToken } =
        await this.tokenProvider.generateTokens(user);
      await this.userService.updateRefreshToken(sub, refreshToken);
      this.logger.debug('refresh tokens updated to db');
      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error('refresh token error: ', error);
      throw new UnauthorizedException(
        'Refresh token expired, please log in again',
      );
    }
  }
}
