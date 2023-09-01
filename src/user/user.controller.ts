import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Delete,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/signIn.dto';
import { AuthGuard } from '../guards/auth.guard';
import { DeleteUserDto } from './dto/delete-user.dto';
import { User } from '../decorators/user.decorator';
import { AuthenticatedUser } from '../protocols/protocols';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('auth/sign-up')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('auth/sign-in')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() signInDto: SignInDto) {
    return this.userService.findOneByEmail(signInDto);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  delete(
    @Body() deleteUserDto: DeleteUserDto,
    @Param('id', ParseIntPipe) id: number,
    @User() user: AuthenticatedUser,
  ) {
    return this.userService.deleteUser(deleteUserDto, user, +id);
  }
}
