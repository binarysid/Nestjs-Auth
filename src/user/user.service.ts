import {
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
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

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    private readonly createUserProvider: CreateUserProvider,

    private readonly findUserProvider: FindUserProvider,

    private readonly configService: ConfigService,

    private readonly logger: LoggerProvider,
  ) {}

  public findAll() {
    const environment = this.configService.get<string>('JWT_TOKEN_AUDIENCE');
    this.logger.debug('env var: ', environment);
    return 'all vals';
  }

  public async create(dto: CreateUserDto) {
    return this.createUserProvider.createUser(dto);
  }

  public async findUserby(email: string) {
    return await this.findUserProvider.findUserby(email);
  }

  public async findUserbyID(id: string) {
    return await this.findUserProvider.findUserbyId(id);
  }
}
