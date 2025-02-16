import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { LoggerProvider } from 'src/logger/logger.provider';
import { UserSessionProvider } from 'src/user/providers/user-session.provider';
import jwtConfig from 'src/auth/config/jwt.config';
import { GenerateTokenProvider } from 'src/auth/providers/generate-token.provider';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { ActiveUserData } from 'src/auth/interfaces/active-user.interface';
import { RefreshTokenDto } from 'src/auth/dtos/refresh-token.dto';

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
    private readonly userSessionProvider: UserSessionProvider,
  ) {}

  public async verify(refreshToken: string) {
    try {
      const { sub } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'>
      >(refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });
      this.logger.debug('refresh token verified');
      return sub;
    } catch (error) {
      this.logger.error('Refresh token expired: ', error);
      return null;
    }
  }

  public async refreshToken(dto: RefreshTokenDto) {
    try {
      const userID = await this.verify(dto.refreshToken);
      if (!userID) {
        this.logger.error('session token expired');
        await this.userSessionProvider.deactive(dto.refreshToken, null);
        throw new UnauthorizedException('session token expired');
      }

      this.logger.debug('refresh token verified');

      const user = await this.userService.findUserbyID(userID);
      this.logger.debug('found user id: ', userID);
      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      this.logger.debug('found user: ', user);

      // if (!user.isVerified) {
      //   this.logger.error('User is not verified');
      //   throw new UnauthorizedException('User is not verified');
      // }

      const userSession = await this.userService.findSessionById(userID);
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
      this.logger.debug('tokens generated');
      userSession.hashedRefreshToken =
        await this.hashingProvider.hash(refreshToken);
      await userSession.save();
      this.logger.debug('refresh token updated to db: ', refreshToken);
      this.logger.debug(
        'hashed refresh token updated to db: ',
        userSession.hashedRefreshToken,
      );
      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error('refresh token generation error: ', error);
      throw new UnauthorizedException(
        'refresh token generation error: ',
        error,
      );
    }
  }
}
