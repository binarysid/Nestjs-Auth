import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user.schema';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { FindUserProvider } from './find-user.provider';

@Injectable()
export class CreateUserProvider {
  constructor(
    @InjectModel(User.name)
    private readonly usersModel: Model<User>,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,

    private readonly findUserProvider: FindUserProvider,
  ) {}

  public async createUser(dto: CreateUserDto) {
    const existingUser = await this.findUserProvider.findUserby(dto.email);
    if (existingUser) {
      console.log('user exists');
      throw new BadRequestException(
        'The user already exists, please check your email.',
      );
    }

    // Create a new user
    try {
      console.log('creating a new user');
      const newUser = await this.usersModel.create({
        ...dto,
        password: await this.hashingProvider.hash(dto.password),
      });
      return newUser;
    } catch (error) {
      console.log('new user creation error');
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to the the datbase',
        },
      );
    }
  }
}
