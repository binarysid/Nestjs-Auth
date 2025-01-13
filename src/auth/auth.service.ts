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

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    private readonly hashingProvider: HashingProvider,
  ) {}

  public login(email: string, password: string) {
    return;
  }

  public isAuth() {
    return true;
  }

  public async signIn(dto: SignInUserDto) {
    let user = await this.userService.findUserby(dto.email);
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
    return true;
  }
}
