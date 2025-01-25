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
// import { GlobalConfig } from './global.config.service';
import { AppLoggerModule } from './logger/logger.module';
import { LoggerProvider } from './logger/logger.provider';
import { LoggerModule } from 'nestjs-pino';
import { GlobalConfigModule } from './global.config/global.config.module';
import { GlobalConfigProvider } from './global.config/global.config.provider';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb+srv://${configService.get('DB_USER')}:${configService.get('DB_PASSWORD')}@${configService.get('DB_HOST')}/${configService.get('DB_NAME')}}`,
      }),
      inject: [ConfigService],
    }),
    LoggerModule.forRootAsync({
      useFactory: (config: GlobalConfigProvider) => ({
        pinoHttp: {
          level: config.isDev ? 'debug' : 'info', // Set log level based on environment
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
    UserModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    AppLoggerModule,
    GlobalConfigModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
    // GlobalConfig,
    LoggerProvider,
  ],
  // exports: [GlobalConfig],
})
export class AppModule {}
