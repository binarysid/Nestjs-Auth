import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HashingProvider } from './providers/hashing.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { UserModule } from 'src/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { GenerateTokenProvider } from './providers/generate-token.provider';
import { RefresehTokenProvider } from './providers/refreseh-token.provider';
import jwtConfig from './config/jwt.config';
import { AppLoggerModule } from 'src/logger/logger.module';
import { LoggerProvider } from 'src/logger/logger.provider';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    JwtService,
    GenerateTokenProvider,
    RefresehTokenProvider,
    LoggerProvider,
  ],
  imports: [
    forwardRef(() => UserModule),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    AppLoggerModule,
  ],
  exports: [AuthService, HashingProvider],
})
export class AuthModule {}
