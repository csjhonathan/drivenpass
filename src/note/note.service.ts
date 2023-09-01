import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteRepository } from './note.repository';

@Injectable()
export class NoteService {
  constructor(private readonly noteRepository: NoteRepository) {}

  async create(createNoteDto: CreateNoteDto, userId: number) {
    const { title } = createNoteDto;

    const note = await this.findOneByTitleAndUserId(title, userId);
    if (note) {
      throw new ConflictException(
        'This note title is already in use in your collection!',
      );
    }
    return this.noteRepository.create(createNoteDto, userId);
  }

  async findAll(userId: number) {
    return this.noteRepository.findAll(userId);
  }

  async findOne(id: number, userId: number) {
    const note = await this.noteRepository.findOne(id);

    if (!note) {
      throw new NotFoundException('Note doesnt exists!');
    }

    if (note.userId !== userId) {
      throw new ForbiddenException(
        'This note doesnt exists in your collection!',
      );
    }

    return note;
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    return this.noteRepository.remove(id, userId);
  }

  private findOneByTitleAndUserId(title: string, userId: number) {
    return this.noteRepository.findOneByTitleAndUserId(title, userId);
  }
}
