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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  exports: [UserService],
  providers: [
    UserService,
    CreateUserProvider,
    FindUserProvider,
    UpdateUserProvider,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
  ],
})
export class UserModule {}
