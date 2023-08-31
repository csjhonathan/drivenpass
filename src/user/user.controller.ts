import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/signIn.dto';

@Controller('user/auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('sign-up')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() signInDto: SignInDto) {
    return this.userService.findOne(signInDto);
  }
}
