import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserProvider } from './providers/create-user.provider';
import { FindUserProvider } from './providers/find-user.provider';
import { ConfigService } from '@nestjs/config';
import { LoggerProvider } from 'src/logger/logger.provider';
import { UpdateUserProvider } from './providers/update-user.provider';
import { PatchUserDto } from './dtos/patch-user.dto';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

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

  public async findUserbyID(id: string) {
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

  public async updateRefreshToken(id: string, refreshToken: string | null) {
    const user: User = await this.findUserProvider.findUserbyId(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const hashedToken = await this.hashingProvider.hash(refreshToken);
    user.hashedRefreshToken = hashedToken;
    return await user.save();
  }
}
