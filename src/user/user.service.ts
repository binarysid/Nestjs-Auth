import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserProvider } from './providers/create-user.provider';
import { FindUserProvider } from './providers/find-user.provider';
import { ConfigService } from '@nestjs/config';
import { LoggerProvider } from 'src/logger/logger.provider';
import { UpdateUserProvider } from './providers/update-user.provider';
import { PatchUserDto } from './dtos/patch-user.dto';
import { UserSession } from './user-session.schema';
import { User } from './user.schema';
import { RefreshTokenDto } from 'src/auth/dtos/refresh-token.dto';
import { VerifyUserDto } from './dtos/verify-user.dto';
import { UserSessionProvider } from './providers/user-session.provider';
import { RefresehTokenProvider } from './providers/refresh-token.provider';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

@Injectable()
export class UserService {
  constructor(
    private readonly createUserProvider: CreateUserProvider,
    private readonly findUserProvider: FindUserProvider,
    private readonly updateUserProvider: UpdateUserProvider,
    private readonly refreshTokenProvider: RefresehTokenProvider,
    private readonly configService: ConfigService,
    private readonly logger: LoggerProvider,
    private readonly userSessionProvider: UserSessionProvider,
    private readonly hashingProvider: HashingProvider,
  ) {}

  public findAll() {
    const environment = this.configService.get<string>('JWT_TOKEN_AUDIENCE');
    // this.logger.debug('env var: ', environment);
    return 'all vals';
  }

  public async refreshToken(dto: RefreshTokenDto) {
    return await this.refreshTokenProvider.refreshToken(dto);
  }

  public async create(dto: CreateUserDto) {
    const existingUser = await this.findUserProvider.findUserby(dto.email);
    if (existingUser) {
      this.logger.debug('The user already exists, please check your email.');
      throw new BadRequestException(
        'The user already exists, please check your email.',
      );
    }
    return await this.createUserProvider.createUser(dto);
  }

  public async findUserby(email: string) {
    return await this.findUserProvider.findUserby(email);
  }

  public async findUserbyID(id: string): Promise<User | null> {
    return await this.findUserProvider.findUserbyId(id);
  }

  public async update(id: string, dto: PatchUserDto) {
    return await this.updateUserProvider.update(id, dto);
  }

  public async updatePassword(id: string, password: string) {
    const user = await this.findUserProvider.findUserbyId(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.password = password;
    return await user.save();
  }

  public async updateSession(id: string, dto: RefreshTokenDto) {
    return await this.updateUserProvider.addSession(id, dto);
  }

  public async findSessionById(id: string): Promise<UserSession | null> {
    return await this.findUserProvider.findSessionByUserId(id);
  }

  public async removeSession(dto: RefreshTokenDto) {
    try {
      const userId = await this.refreshTokenProvider.verify(dto.refreshToken);
      if (!userId) {
        this.logger.error('session token expired');
        await this.userSessionProvider.deactive(dto.refreshToken, null);
        throw new UnauthorizedException('session token expired');
      }

      this.logger.debug('refresh token verified');

      const userSession: UserSession =
        await this.userSessionProvider.findSessionByUserID(userId);
      if (!userSession) {
        this.logger.error('User session not found');
        throw new UnauthorizedException('User session not found');
      }

      this.logger.debug('user session exists');
      if (!userSession.hashedRefreshToken) {
        this.logger.error('User session already expired');
        throw new UnauthorizedException('User session already expired');
      }
      this.logger.debug('refresh token: ', dto.refreshToken);
      this.logger.debug(
        'hashed refresh token: ',
        userSession.hashedRefreshToken,
      );

      if (dto.refreshToken !== userSession.hashedRefreshToken) {
        this.logger.error(
          'refresh token doesnot match with the stored session token',
        );
        throw new UnauthorizedException(
          'refresh token doesnot match with the stored session token',
        );
      }
      // let isEqual = false;
      // try {
      //   isEqual = await this.hashingProvider.compare(
      //     dto.refreshToken,
      //     userSession.hashedRefreshToken,
      //   );
      // } catch (error) {
      //   this.logger.error('Could not compare password', error);
      //   throw new RequestTimeoutException(error, {
      //     description: 'Could not compare password',
      //   });
      // }
      // this.logger.debug('isEqual: ', isEqual);

      // if (!isEqual) {
      //   this.logger.error('refresh token not found in the session');
      //   throw new UnauthorizedException(
      //     'refresh token not found in the session',
      //   );
      // }

      this.logger.debug('session token found');
      userSession.hashedRefreshToken = null;
      this.logger.debug(
        'refresh token updated to ',
        userSession.hashedRefreshToken,
      );
      return await userSession.save();
    } catch (error) {
      this.logger.error('Refresh token error: ', error);
      throw new UnauthorizedException('Refresh token error: ', error);
    }
  }

  public async hasSession(userId: string): Promise<boolean> {
    const userSession: UserSession = await this.findSessionById(userId);
    this.logger.debug('userSession:', userSession);
    this.logger.debug('hashedRefreshToken:', userSession?.hashedRefreshToken);
    this.logger.debug(
      'hashedRefreshToken check:',
      !!userSession && userSession.hashedRefreshToken !== null,
    );

    return !!userSession && userSession.hashedRefreshToken !== null;
  }

  public async verify(dto: VerifyUserDto) {
    return await this.updateUserProvider.updateUserVerificationStatus(dto);
  }
}
