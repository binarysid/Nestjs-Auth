import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { GenerateTokenProvider } from './generate-token.provider';
import { ActiveUserData } from '../interfaces/active-user.interface';
import { LoggerProvider } from 'src/logger/logger.provider';

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
      this.logger.debug('found user id: ', sub);
      const user = await this.userService.findUserbyID(sub);
      if (!user) {
        throw new Error('User not found');
      }
      this.logger.debug('found user: ', user);
      return await this.tokenProvider.generateTokens(user);
    } catch (error) {
      this.logger.error('refresh token error: ', error);
      throw new Error('Could not refresh token');
    }
  }
}
