import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserProvider } from './providers/create-user.provider';
import { FindUserProvider } from './providers/find-user.provider';
import { ConfigService } from '@nestjs/config';
import { LoggerProvider } from 'src/logger/logger.provider';
import { UpdateUserProvider } from './providers/update-user.provider';
import { PatchUserDto } from './dtos/patch-user.dto';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { UserSession } from './user-session.schema';
import { User } from './user.schema';
import { RefreshTokenDto } from 'src/auth/dtos/refresh-token.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly createUserProvider: CreateUserProvider,
    private readonly findUserProvider: FindUserProvider,
    private readonly updateUserProvider: UpdateUserProvider,
    private readonly configService: ConfigService,
    private readonly logger: LoggerProvider,
    private readonly hashingProvider: HashingProvider,
  ) {}

  public findAll() {
    const environment = this.configService.get<string>('JWT_TOKEN_AUDIENCE');
    // this.logger.debug('env var: ', environment);
    return 'all vals';
  }

  public async create(dto: CreateUserDto) {
    const existingUser = await this.findUserProvider.findUserby(dto.email);
    if (existingUser) {
      this.logger.debug('user exists');
      throw new BadRequestException(
        'The user already exists, please check your email.',
      );
    }
    return await this.createUserProvider.createUser(dto);
  }

  public async findUserby(email: string) {
    return await this.findUserProvider.findUserby(email);
  }

  public async findUserbyID(id: string): Promise<User | null> {
    return await this.findUserProvider.findUserbyId(id);
  }

  public async update(id: string, dto: PatchUserDto) {
    return await this.updateUserProvider.update(id, dto);
  }

  public async updatePassword(id: string, password: string) {
    const user = await this.findUserProvider.findUserbyId(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.password = password;
    return await user.save();
  }

  public async updateSession(id: string, dto: RefreshTokenDto) {
    return await this.updateUserProvider.addSession(id, dto);
  }

  public async findSessionById(id: string): Promise<UserSession | null> {
    return await this.findUserProvider.findSessionByUserId(id);
  }

  public async updateRefreshToken(id: string, refreshToken: string | null) {
    const userSession: UserSession = await this.findSessionById(id);
    if (!userSession) {
      throw new NotFoundException('User session not found');
    }

    const hashedToken = await this.hashingProvider.hash(refreshToken);
    userSession.hashedRefreshToken = hashedToken;
    return await userSession.save();
  }

  public async hasSession(userId: string): Promise<boolean> {
    const userSession = await this.findSessionById(userId);
    return !!userSession;
  }
}
