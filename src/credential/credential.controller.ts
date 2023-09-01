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
} from '@nestjs/common';
import { CredentialService } from './credential.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User } from 'src/decorators/user.decorator';
import { User as UserPrisma } from '@prisma/client';

@UseGuards(AuthGuard)
@Controller('credentials')
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}

  @Post()
  create(
    @Body() createCredentialDto: CreateCredentialDto,
    @User() user: Omit<UserPrisma, 'password' | 'createdAt' | 'updatedAt'>,
  ) {
    return this.credentialService.create(createCredentialDto, user);
  }

  @Get()
  findAll(
    @User() user: Omit<UserPrisma, 'password' | 'createdAt' | 'updatedAt'>,
  ) {
    const { id: userId } = user;
    return this.credentialService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @User() user: Omit<UserPrisma, 'password' | 'createdAt' | 'updatedAt'>,
  ) {
    const { id: userId } = user;
    return this.credentialService.findOne(+id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @User() user: Omit<UserPrisma, 'password' | 'createdAt' | 'updatedAt'>,
  ) {
    const { id: userId } = user;
    return this.credentialService.remove(+id, userId);
  }
}
