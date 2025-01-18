import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { PatchUserDto } from './dtos/patch-user.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token/access-token.guard';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @Auth(AuthType.None) // here we can pass multiple types with comma separated values. but if one of the type is None/public, the entire route becomes public
  public async create(@Body() dto: CreateUserDto) {
    console.log('type dto: ', typeof dto);
    console.log('instance dto: ', dto instanceof CreateUserDto);
    return dto;
    // return this.userService.create(dto);
  }

  @Get('all')
  public async findAll() {
    console.log('find all');
    return this.userService.findAll();
  }

  @Patch('update')
  public async patch(
    @Body() dto: PatchUserDto,

    // if we want the whole user object rather than just the email,
    // then dont pass any argument to the @ActiveUser decorator
    @ActiveUser('email') user: ActiveUserData,
  ) {
    console.log('user: ', user);
    return dto;
  }
}
