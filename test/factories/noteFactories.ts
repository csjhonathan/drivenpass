import { faker } from '@faker-js/faker';
import { PrismaService } from '../../src/prisma/prisma.service';

type InsertNote = {
  title?: string;
  text?: string;
};

export class NoteFactories {
  static noteWithoutFieldorFullBody(field?: 'title' | 'text'): InsertNote {
    switch (field) {
      case 'title':
        return {
          text: faker.lorem.lines({ min: 4, max: 8 }),
        };
      case 'text':
        return {
          title: faker.internet.domainWord(),
        };
      default:
        return {
          title: faker.internet.domainWord(),
          text: faker.lorem.lines({ min: 4, max: 8 }),
        };
    }
  }

  static createDbNote(prisma: PrismaService, note: InsertNote, userId: number) {
    return prisma.note.create({
      data: { title: note.title, text: note.text, userId },
      select: {
        id: true,
        title: true,
        text: true,
        userId: true,
      },
    });
  }

  static getNoteByIdOnPrisma(prisma: PrismaService, id: number) {
    return prisma.credential.findUnique({ where: { id } });
  }
}
