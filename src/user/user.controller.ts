import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/signIn.dto';
import { AuthGuard } from '../guards/auth.guard';
import { DeleteUserDto } from './dto/delete-user.dto';
import { User } from '../decorators/user.decorator';
import { AuthenticatedUser } from '../protocols/protocols';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('auth/sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register an user!' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Your user is succesfully created!',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Sended email is already in use!',
  })
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('auth/sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Provides access to a user!' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Login successful and you receive a token to be able to access private routes!',
    content: {
      'application/json': {
        example: {
          token: 'your_jwt_access_token',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description:
      'Your email doesnt exists in database or your password is wrong!',
  })
  signIn(@Body() signInDto: SignInDto) {
    return this.userService.findOneByEmail(signInDto);
  }

  @UseGuards(AuthGuard)
  @Delete('/erase')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Hard delete to all user data, this action may not be reverted!',
  })
  @ApiBody({ type: DeleteUserDto })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description:
      'The deletion was successful, all user data has been erased and cannot be recovered!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description:
      'Your email doesnt exists in database, your password is wrong or your jtw token is invalid!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      "For some reason you tried to delete a user that doesn't exist!",
  })
  @ApiBearerAuth()
  delete(
    @Body() deleteUserDto: DeleteUserDto,
    @User() user: AuthenticatedUser,
  ) {
    return this.userService.deleteUser(deleteUserDto, user);
  }
}
