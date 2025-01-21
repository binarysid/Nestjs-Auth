import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { GenerateTokenProvider } from './generate-token.provider';
import { ActiveUserData } from '../interfaces/active-user.interface';

@Injectable()
export class RefresehTokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly tokenProvider: GenerateTokenProvider,
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
      console.log('found user id: ', sub);
      const user = await this.userService.findUserbyID(sub);
      if (!user) {
        throw new Error('User not found');
      }
      console.log('found user: ', user);
      return await this.tokenProvider.generateTokens(user);
    } catch (error) {
      console.log('refresh token error: ', error);
      throw new Error('Could not refresh token');
    }
  }
}
