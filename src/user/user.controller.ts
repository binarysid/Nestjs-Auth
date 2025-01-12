import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { PatchUserDto } from './dtos/patch-user.dto';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    @Post('register')
    public async create(@Body() dto: CreateUserDto) {
        console.log("type dto: ", typeof dto);
        console.log("instance dto: ", dto instanceof CreateUserDto);
        return dto
        // return this.userService.create(dto);
    }

    @Get('all')
    public async findAll() {
        return "Hello TTS";
    }

    @Patch('update')
    public async patch(@Body() dto: PatchUserDto) {
        return dto
    }
}
