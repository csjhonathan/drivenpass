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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NoteHelpers } from '../helpers/note.helper';

@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register an note for user!' })
  @ApiBody({ type: CreateNoteDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Your note is succesfully created!',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Sended note title is already in use in your collection!',
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
    @Body() createNoteDto: CreateNoteDto,
    @User() user: AuthenticatedUser,
  ) {
    const { id } = user;
    return this.noteService.create(createNoteDto, id);
  }

  @Get()
  @ApiOperation({ summary: 'Provides a list with all user notes!' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'You received a list with all notes, or empty array if theres no exists notes!',
    content: {
      'application/json': {
        example: {
          notes: [
            NoteHelpers.getNoteExample(),
            NoteHelpers.getNoteExample(),
            NoteHelpers.getNoteExample(),
            NoteHelpers.getNoteExample(),
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

    return this.noteService.findAll(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Provides a unique note for that user!' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'You received one note by requested note id!',
    content: {
      'application/json': {
        example: {
          note: NoteHelpers.getNoteExample(),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The requested note not exists in database!',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'The requested note not existes in user collection',
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

    return this.noteService.findOne(+id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a unique note for that user!' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The requested note has been delete by note id',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The requested note not exists in database!',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'The requested note not existes in user collection',
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

    return this.noteService.remove(+id, userId);
  }
}
