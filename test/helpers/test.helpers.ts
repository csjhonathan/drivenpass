import { PrismaService } from './../../src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TestHelpers {
  static async cleanDb(prisma: PrismaService) {
    await prisma.credential.deleteMany({});
    await prisma.note.deleteMany({});
    await prisma.card.deleteMany({});
    await prisma.cardType.deleteMany({});
    await prisma.user.deleteMany({});
  }
}
