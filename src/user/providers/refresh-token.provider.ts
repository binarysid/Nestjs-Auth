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
import { ErrorConstant } from 'src/constants.ts/error.constant';

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
      this.logger.error(ErrorConstant.SESSION_TOKEN_EXPIRED, error);
      return null;
    }
  }

  public async refreshToken(dto: RefreshTokenDto) {
    try {
      const userID = await this.verify(dto.refreshToken);
      if (!userID) {
        this.logger.error(ErrorConstant.SESSION_TOKEN_EXPIRED);
        await this.userSessionProvider.deactive(dto.refreshToken, null);
        throw new UnauthorizedException(ErrorConstant.SESSION_TOKEN_EXPIRED);
      }

      this.logger.debug('refresh token verified');

      const user = await this.userService.findUserbyID(userID);
      this.logger.debug('found user id: ', userID);
      if (!user) {
        this.logger.error(ErrorConstant.USER_NOT_FOUND);
        throw new NotFoundException(ErrorConstant.USER_NOT_FOUND);
      }

      this.logger.debug('found user: ', user);

      // if (!user.isVerified) {
      //   this.logger.error('User is not verified');
      //   throw new UnauthorizedException('User is not verified');
      // }

      const userSession = await this.userService.findSessionById(userID);
      if (!userSession) {
        this.logger.error(ErrorConstant.SESSION_NOT_FOUND);
        throw new NotFoundException(ErrorConstant.SESSION_NOT_FOUND);
      }
      this.logger.debug('found user session: ', userSession);

      if (!userSession.hashedRefreshToken) {
        this.logger.error(ErrorConstant.SESSION_TOKEN_NOT_FOUND);
        throw new UnauthorizedException(ErrorConstant.SESSION_TOKEN_NOT_FOUND);
      }

      //   const isEqual = await this.hashingProvider.compare(
      //     dto.refreshToken,
      //     userSession.hashedRefreshToken,
      //   );
      if (dto.refreshToken !== userSession.hashedRefreshToken) {
        this.logger.error(ErrorConstant.SESSION_TOKEN_DOES_NOT_MATCH);
        throw new UnauthorizedException(
          ErrorConstant.SESSION_TOKEN_DOES_NOT_MATCH,
        );
      }

      this.logger.debug('refresh tokens matched. Ready to generate new tokens');

      const { accessToken, refreshToken } =
        await this.tokenProvider.generateTokens(user);
      this.logger.debug('new tokens generated', refreshToken);
      userSession.hashedRefreshToken = refreshToken;
      await userSession.save();
      this.logger.debug('refresh token updated to db');
      this.logger.debug(
        'hashed refresh token: ',
        userSession.hashedRefreshToken,
      );
      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(ErrorConstant.SESSION_TOKEN_GENERATION, error);
      throw new UnauthorizedException(
        ErrorConstant.SESSION_TOKEN_GENERATION,
        error,
      );
    }
  }
}
