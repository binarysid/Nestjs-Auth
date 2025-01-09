import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, MongooseModule.forRoot('mongodb://localhost:27017/', 
  { dbName: 'user'}
  ), UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
