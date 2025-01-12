import { BadRequestException, forwardRef, Inject, Injectable, RequestTimeoutException } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user.schema';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

@Injectable()
export class CreateUserProvider {
    constructor(
        @InjectModel(User.name)
        private readonly usersModel: Model<User>,
        
        @Inject(forwardRef(() => HashingProvider))
        private readonly hashingProvider: HashingProvider
    ){}

    public async createUser(createUserDto: CreateUserDto) {
        let existingUser = undefined;
    
        try {
          // Check is user exists with same email
          existingUser = await this.usersModel.findOne(
            { "email": createUserDto.email },
            '_id'
          );
        } catch (error) {
          throw new RequestTimeoutException(
            'Unable to process your request at the moment please try later',
            {
              description: 'Error connecting to the database',
            },
          );
        }
    
        // Handle exception
        if (existingUser) {
          throw new BadRequestException(
            'The user already exists, please check your email.',
          );
        }
    
        // Create a new user
        try {
            const newUser = await this.usersModel.create({
            ...createUserDto,
            password: await this.hashingProvider.hash(createUserDto.password),
            });
            return newUser
        } catch (error) {
          throw new RequestTimeoutException(
            'Unable to process your request at the moment please try later',
            {
              description: 'Error connecting to the the datbase',
            },
          );
        }
    }
}
 