import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { FindUserProvider } from './find-user.provider';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user.schema';
import { Model } from 'mongoose';
import { PatchUserDto } from '../dtos/patch-user.dto';
import { RefreshTokenDto } from 'src/auth/dtos/refresh-token.dto';
import { UserSession } from '../user-session.schema';
import { LoggerProvider } from 'src/logger/logger.provider';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

@Injectable()
export class UpdateUserProvider {
  constructor(
    @InjectModel(User.name)
    private readonly usersModel: Model<User>,
    @InjectModel(UserSession.name)
    private readonly userSessionModel: Model<UserSession>,
    private readonly findUserProvider: FindUserProvider,
    private readonly logger: LoggerProvider,
    private readonly hashingProvider: HashingProvider,
  ) {}

  public async update(id: string, dto: PatchUserDto): Promise<User> {
    const existingUser = await this.findUserProvider.findUserbyId(id);
    if (existingUser) {
      // Filter out undefined fields before updating
      const updateData = Object.fromEntries(
        Object.entries(dto).filter(([_, value]) => value !== undefined),
      );

      return await this.usersModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });
    } else {
      throw new NotFoundException('User not found');
    }
  }

  public async addSession(
    id: string,
    dto: RefreshTokenDto,
  ): Promise<UserSession> {
    const existingSession = await this.findUserProvider.findSessionByUserId(id);
    if (existingSession) {
      return await this.updateSession(id, dto);
    } else {
      return await this.createSession(dto);
    }
  }

  async updateSession(id: string, dto: RefreshTokenDto): Promise<UserSession> {
    // Filter out undefined fields before updating
    const updateData = Object.fromEntries(
      Object.entries(dto).filter(([_, value]) => value !== undefined),
    );

    return await this.userSessionModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }

  async createSession(dto: RefreshTokenDto): Promise<UserSession> {
    try {
      this.logger.debug('creating a new user');
      const newSession = await this.userSessionModel.create({
        ...dto,
        refreshToken: await this.hashingProvider.hash(dto.refreshToken),
      });
      this.logger.debug('new session created');
      return newSession;
    } catch (error) {
      this.logger.error('session creation error');
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to the the datbase',
        },
      );
    }
  }
}
