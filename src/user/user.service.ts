import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserProvider } from './providers/create-user.provider';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    private readonly createUserProvider: CreateUserProvider,
  ) {}

  public async create(dto: CreateUserDto) {
    return this.createUserProvider.createUser(dto);
  }
}
