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
    userId: string,
    dto: RefreshTokenDto,
  ): Promise<UserSession> {
    const existingSession =
      await this.findUserProvider.findSessionByUserId(userId);
    if (existingSession) {
      this.logger.debug('session exists, updating');
      return await this.updateSession(userId, dto);
    } else {
      this.logger.debug('session does not exist, creating');
      return await this.createSession(userId, dto);
    }
  }

  async updateSession(id: string, dto: RefreshTokenDto): Promise<UserSession> {
    try {
      if (dto.refreshToken) {
        dto.refreshToken = await this.hashingProvider.hash(dto.refreshToken);
        this.logger.debug('hashed refresh token for session update');
      }
      // Filter out undefined fields before updating
      const updateData = Object.fromEntries(
        Object.entries(dto).filter(([_, value]) => value !== undefined),
      );

      return await this.userSessionModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });
    } catch (error) {
      this.logger.error('session update error');
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to the the datbase',
        },
      );
    }
  }

  async createSession(
    userId: string,
    dto: RefreshTokenDto,
  ): Promise<UserSession> {
    try {
      this.logger.debug('creating a new session');
      const newSession = await this.userSessionModel.create({
        user: userId, // Include user ID
        hashedRefreshToken: await this.hashingProvider.hash(dto.refreshToken),
        deviceID: dto.deviceID,
        userAgent: dto.userAgent,
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
