import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { CreateUserProvider } from './providers/create-user.provider';
import { FindUserProvider } from './providers/find-user.provider';
import { UpdateUserProvider } from './providers/update-user.provider';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { BcryptProvider } from 'src/auth/providers/bcrypt.provider';
import { UserSession, UserSessionSchema } from './user-session.schema';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from 'src/auth/config/jwt.config';
import { UserSessionProvider } from './providers/user-session.provider';
import { RefresehTokenProvider } from './providers/refresh-token.provider';
import { GenerateTokenProvider } from 'src/auth/providers/generate-token.provider';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserSession.name, schema: UserSessionSchema },
    ]),
    forwardRef(() => AuthModule),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [UserController],
  exports: [UserService],
  providers: [
    JwtService,
    UserService,
    CreateUserProvider,
    FindUserProvider,
    UpdateUserProvider,
    RefresehTokenProvider,
    UserSessionProvider,
    GenerateTokenProvider,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
  ],
})
export class UserModule {}
