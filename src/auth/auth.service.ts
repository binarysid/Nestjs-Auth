import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
    ){}
    public login(email: string, password: string) {
        return
    }
    public isAuth() {
        return true;
    }
}
