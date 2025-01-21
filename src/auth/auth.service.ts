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

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    private readonly hashingProvider: HashingProvider,

    private readonly tokenProvider: GenerateTokenProvider,

    private readonly refresehTokenProvider: RefresehTokenProvider,
  ) {}

  public async signIn(dto: SignInUserDto) {
    const user = await this.userService.findUserby(dto.email);
    if (!user) {
      throw new UnauthorizedException('User does not exists');
    }

    let isEqual = false;
    console.log('found user: ', user);
    try {
      const hashedPass = await this.hashingProvider.hash(dto.password);
      isEqual = await this.hashingProvider.compare(dto.password, user.password);
    } catch (error) {
      console.log('password compare error');
      throw new RequestTimeoutException(error, {
        description: 'Could not compare password',
      });
    }

    if (!isEqual) {
      throw new UnauthorizedException('Incorrect password');
    }
    console.log('logged in success');

    return await this.tokenProvider.generateTokens(user);
  }

  public async refreshToken(dto: RefreshTokenDto) {
    return await this.refresehTokenProvider.refreshToken(dto);
  }
}
