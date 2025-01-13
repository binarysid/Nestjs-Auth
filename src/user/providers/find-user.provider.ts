import {
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user.schema';

@Injectable()
export class FindUserProvider {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  public async findUserby(email: String) {
    let user = undefined;
    console.log('user find request');
    try {
      user = await this.userModel.findOne({ email: email });
    } catch (error) {
      console.log('existing user check error');
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to the database',
        },
      );
    }

    if (!user) {
      console.log('user does not exists');
      throw new UnauthorizedException('User does not exists');
    }

    console.log('user found');
    return user;
  }
}
