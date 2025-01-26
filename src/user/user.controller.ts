import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { PatchUserDto } from './dtos/patch-user.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user.interface';
import { LoggerProvider } from 'src/logger/logger.provider';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { GetUsersParamDto } from './dtos/get-user-param.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: LoggerProvider,
  ) {}

  @Post('register')
  @Auth(AuthType.None) // here we can pass multiple types with comma separated values. but if one of the type is None/public, the entire route becomes public
  public async create(@Body() dto: CreateUserDto) {
    return dto;
    // return this.userService.create(dto);
  }

  @Get('all')
  @Auth(AuthType.None)
  public async findAll() {
    this.logger.debug('find all');
    return this.userService.findAll();
  }

  @Patch('update')
  public async patch(
    @Body() dto: PatchUserDto,

    // if we want the whole user object rather than just the email,
    // then dont pass any argument to the @ActiveUser decorator
    @ActiveUser('email') user: ActiveUserData,
  ) {
    this.logger.debug('user: ', user);
    return dto;
  }

  @Get('/:id?')
  @ApiOperation({
    summary: 'Fetches a list of registered users on the application.',
  })
  @ApiQuery({
    name: 'limit',
    type: String,
    description: 'The upper limit of pages you want the pagination to return',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    type: String,
    description:
      'The position of the page number that you want the API to return',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Users fetched successfully based on the query',
  })
  public getUsers(
    @Param() getUserParamDto: GetUsersParamDto,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return 'all users';
  }
}
