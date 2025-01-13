import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInUserDto } from 'src/user/dtos/signin-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('login')
  public async signIn(@Body() dto: SignInUserDto) {
    return await this.service.signIn(dto);
  }
}
