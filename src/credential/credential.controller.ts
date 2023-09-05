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
import { ApiTags } from '@nestjs/swagger';

@ApiTags('credentials')
@UseGuards(AuthGuard)
@Controller('credentials')
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createCredentialDto: CreateCredentialDto,
    @User() user: AuthenticatedUser,
  ) {
    const { id } = user;

    return this.credentialService.create(createCredentialDto, id);
  }

  @Get()
  findAll(@User() user: AuthenticatedUser) {
    const { id } = user;

    return this.credentialService.findAll(id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: string,
    @User() user: AuthenticatedUser,
  ) {
    const { id: userId } = user;

    return this.credentialService.findOne(+id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: string,
    @User() user: AuthenticatedUser,
  ) {
    const { id: userId } = user;

    return this.credentialService.remove(+id, userId);
  }
}
