import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User } from '../decorators/user.decorator';
import { AuthenticatedUser } from '../protocols/protocols';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('notes')
@UseGuards(AuthGuard)
@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createNoteDto: CreateNoteDto,
    @User() user: AuthenticatedUser,
  ) {
    const { id } = user;
    return this.noteService.create(createNoteDto, id);
  }

  @Get()
  findAll(@User() user: AuthenticatedUser) {
    const { id } = user;

    return this.noteService.findAll(id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: string,
    @User() user: AuthenticatedUser,
  ) {
    const { id: userId } = user;

    return this.noteService.findOne(+id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: string,
    @User() user: AuthenticatedUser,
  ) {
    const { id: userId } = user;

    return this.noteService.remove(+id, userId);
  }
}
