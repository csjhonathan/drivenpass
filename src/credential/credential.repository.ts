import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCredentialDto } from './dto/create-credential.dto';

@Injectable()
export class CredentialRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOneByTitleAndUserId(title: string, userId: number) {
    return this.prisma.credential.findUnique({
      where: {
        title_userId: { title, userId },
      },
    });
  }

  create(createCredentialDto: CreateCredentialDto, userId: number) {
    return this.prisma.credential.create({
      data: {
        ...createCredentialDto,
        userId,
      },
      select: {
        id: true,
        title: true,
        url: true,
        password: true,
        userId: true,
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.credential.findMany({
      where: { userId },
    });
  }

  findOne(id: number) {
    return this.prisma.credential.findUnique({
      where: { id },
    });
  }

  remove(id: number) {
    return this.prisma.credential.delete({ where: { id } });
  }
}
