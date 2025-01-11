import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>
    ) {}

    public async create(dto: CreateUserDto) {
        try {
            const newUser = new this.userModel(dto);
            return await newUser.save();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'Error creating user',
            }, HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }
}