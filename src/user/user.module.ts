import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { CreateUserProvider } from './providers/create-user.provider';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema }]
        ),
        forwardRef(() => AuthModule)
    ],
    controllers: [UserController],
    exports: [UserService],
    providers: [UserService, CreateUserProvider],
})
export class UserModule {}
