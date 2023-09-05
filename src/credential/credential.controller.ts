import { AuthenticatedUser } from './../protocols/protocols';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { CredentialService } from './credential.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User } from '../decorators/user.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CredentialHelpers } from '../helpers/credential.helpers';

@ApiTags('credentials')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('credentials')
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register an credential for user!' })
  @ApiBody({ type: CreateCredentialDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Your credential is succesfully created!',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Sended credential title is already in use in your collection!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Request body have invalid format or data!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The provided jwt token is invalid!',
  })
  create(
    @Body() createCredentialDto: CreateCredentialDto,
    @User() user: AuthenticatedUser,
  ) {
    const { id } = user;

    return this.credentialService.create(createCredentialDto, id);
  }

  @Get()
  @ApiOperation({ summary: 'Provides a list with all user credentials!' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'You received a list with all credentials, or empty array if theres no exists credentials!',
    content: {
      'application/json': {
        example: {
          credentials: [
            CredentialHelpers.getCredentialExample(),
            CredentialHelpers.getCredentialExample(),
            CredentialHelpers.getCredentialExample(),
            CredentialHelpers.getCredentialExample(),
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The provided jwt token is invalid!',
  })
  findAll(@User() user: AuthenticatedUser) {
    const { id } = user;

    return this.credentialService.findAll(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Provides a unique credential for that user!' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'You received one credential by requested credential id!',
    content: {
      'application/json': {
        example: {
          credential: CredentialHelpers.getCredentialExample(),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The requested credential not exists in database!',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'The requested credential not existes in user collection',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The provided jwt token is invalid!',
  })
  findOne(
    @Param('id', ParseIntPipe) id: string,
    @User() user: AuthenticatedUser,
  ) {
    const { id: userId } = user;

    return this.credentialService.findOne(+id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a unique credential for that user!' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The requested credential has been delete by credential id',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The requested credential not exists in database!',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'The requested credential not existes in user collection',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The provided jwt token is invalid!',
  })
  remove(
    @Param('id', ParseIntPipe) id: string,
    @User() user: AuthenticatedUser,
  ) {
    const { id: userId } = user;

    return this.credentialService.remove(+id, userId);
  }
}
