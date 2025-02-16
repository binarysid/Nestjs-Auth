import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user.schema';
import { LoggerProvider } from 'src/logger/logger.provider';
import { UserSession } from '../user-session.schema';

@Injectable()
export class FindUserProvider {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(UserSession.name)
    private readonly userSessionModel: Model<UserSession>,
    private readonly logger: LoggerProvider,
  ) {}

  public async findUserby(email: string) {
    let user = null;
    this.logger.debug('user find request: ', email);
    try {
      user = await this.userModel.findOne({ email: email });
    } catch (error) {
      this.logger.error('existing user check error');
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to the database',
        },
      );
    }

    if (!user) {
      this.logger.debug('user does not exists');
    } else {
      this.logger.debug('user found');
    }

    return user;
  }

  public async findUserbyId(id: string) {
    let user = null;
    this.logger.debug('user find request: ', id);
    try {
      user = await this.userModel.findOne({ _id: id });
    } catch (error) {
      this.logger.error('existing user check error');
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to the database',
        },
      );
    }

    if (!user) {
      this.logger.debug('user does not exists');
    } else {
      this.logger.debug('user found');
    }

    return user;
  }

  public async findSessionByUserId(userId: string) {
    let userSession = null;
    this.logger.debug('user session find request: ', userId);
    try {
      userSession = await this.userSessionModel.findOne({ user: userId });
    } catch (error) {
      this.logger.error('existing user session check error');
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to the database',
        },
      );
    }

    if (!userSession) {
      this.logger.debug('user session does not exists');
    } else {
      this.logger.debug('user session found');
    }

    return userSession;
  }
}
