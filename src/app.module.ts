import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { CreateUserProvider } from './user/providers/create-user.provider';

@Module({
  imports: [AuthModule, MongooseModule.forRoot('mongodb+srv://linkondevin:iFEvoVw3hrp2WEL5@cluster0.byyod.mongodb.net/', 
  { dbName: 'user'}
  ), UserModule],
  controllers: [AppController],
  providers: [AppService, CreateUserProvider],
})
export class AppModule {}
