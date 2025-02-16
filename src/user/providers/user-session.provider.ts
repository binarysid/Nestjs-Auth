import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoggerProvider } from 'src/logger/logger.provider';
import { UserSession } from '../user-session.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

@Injectable()
export class UserSessionProvider {
  constructor(
    @InjectModel(UserSession.name)
    private readonly userSessionModel: Model<UserSession>,
    private readonly logger: LoggerProvider,
    private readonly hashingProvider: HashingProvider,
  ) {}

  public async verify(refreshToken: string) {}

  public async deactive(
    refreshToken?: string,
    userID?: string,
  ): Promise<UserSession> {
    if (refreshToken) {
      const hashedRefreshToken = await this.hashingProvider.hash(refreshToken);
      const session: UserSession =
        await this.findSessionByToken(hashedRefreshToken);
      if (!session) {
        this.logger.error('refresh token not found in session');
        throw new UnauthorizedException('refresh token not found in session');
      }

      session.hashedRefreshToken = null;
      return await session.save();
    } else if (userID) {
      const session: UserSession = await this.findSessionByUserID(userID);
      if (!session) {
        this.logger.error('userID not found in session');
        throw new UnauthorizedException('refresh token not found in session');
      }

      session.hashedRefreshToken = null;
      return await session.save();
    } else {
      throw new UnauthorizedException('Invalid token');
    }
  }

  public async findSessionByToken(refreshToken: string) {
    return await this.userSessionModel.findOne({
      hashedRefreshToken: refreshToken,
    });
  }

  public async findSessionByUserID(id: string) {
    return await this.userSessionModel.findOne({ user: id });
  }
}
