import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from 'src/auth/guards/access-token/access-token.guard';
import jwtConfig from 'src/auth/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationGuard } from './auth/guards/authentication/authentication.guard';
import { AppLoggerModule } from './logger/logger.module';
import { LoggerModule } from 'nestjs-pino';
import { GlobalConfigModule } from './global.config/global.config.module';
import { GlobalConfigProvider } from './global.config/global.config.provider';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerConfig, ThrottlerType } from './enums/throttler-type.enum';

@Module({
  imports: [
    GlobalConfigModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: GlobalConfigProvider.envFilePath,
    }),
    MongooseModule.forRootAsync({
      imports: [GlobalConfigModule],
      useFactory: async (config: GlobalConfigProvider) => ({
        uri: config.dbURI,
      }),
      inject: [GlobalConfigProvider],
    }),
    LoggerModule.forRootAsync({
      imports: [GlobalConfigModule],
      useFactory: async (config: GlobalConfigProvider) => ({
        pinoHttp: {
          level: config.logLevel, // Set log level based on environment
          transport: config.isDev
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  timestampKey: '',
                },
              }
            : undefined,
          customLogLevel(req, res, err) {
            if (res.statusCode >= 500 || err) {
              return 'error';
            }
            if (res.statusCode >= 400) {
              return 'warn';
            }
            return 'info';
          },
          customSuccessMessage(req, res) {
            return `Request to ${req.url}`; // Suppress success messages for 'debug' level
          },
          customErrorMessage(req, res, err) {
            return err ? `Error occurred: ${err.message}` : null;
          },
          quietReqLogger: true,
          autoLogging: {
            ignore(req) {
              // Suppress HTTP request logs for 'debug' level
              return config.isDev;
            },
          },
        },
      }),
      inject: [GlobalConfigProvider],
    }),

    ThrottlerModule.forRoot([
      {
        ...ThrottlerConfig.options[ThrottlerType.DEFAULT],
      },
      {
        name: ThrottlerType.SHORT,
        ...ThrottlerConfig.options[ThrottlerType.SHORT],
      },
      {
        name: ThrottlerType.MEDIUM,
        ...ThrottlerConfig.options[ThrottlerType.MEDIUM],
      },
      {
        name: ThrottlerType.LONG,
        ...ThrottlerConfig.options[ThrottlerType.LONG],
      },
    ]),
    UserModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    AppLoggerModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Add throttler guard here
    },
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
  ],
})
export class AppModule {}
