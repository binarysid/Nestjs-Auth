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
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    private readonly hashingProvider: HashingProvider,

    private readonly jwtService: JwtService,
  ) {}

  public isAuth() {
    return true;
  }

  public async signIn(dto: SignInUserDto) {
    const user = await this.userService.findUserby(dto.email);
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
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        audience: 'localhost:3000/',
        issuer: 'localhost:3000/',
        secret: 'my-api-secret',
        expiresIn: 3600,
      },
    );
    return {
      accessToken,
    };
  }
}
