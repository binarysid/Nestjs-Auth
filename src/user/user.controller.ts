import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    @Post('register')
    public async create(@Body() dto: CreateUserDto) {
        return dto
        // return this.userService.create(dto);
    }

    @Get('all')
    public async findAll() {
        return "Hello TTS";
    }
}
