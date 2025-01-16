import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { PatchUserDto } from './dtos/patch-user.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token/access-token.guard';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @Auth(AuthType.None)
  public async create(@Body() dto: CreateUserDto) {
    console.log('type dto: ', typeof dto);
    console.log('instance dto: ', dto instanceof CreateUserDto);
    // return dto;
    return this.userService.create(dto);
  }

  @Get('all')
  public async findAll() {
    console.log('find all');
    return this.userService.findAll();
  }

  // @UseGuards(AccessTokenGuard)
  @Patch('update')
  public async patch(@Body() dto: PatchUserDto) {
    return dto;
  }
}
