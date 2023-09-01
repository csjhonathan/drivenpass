import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';

@Injectable()
export class CardRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOneByTitleAndUserId(title: string, userId: number) {
    return this.prisma.card.findUnique({
      where: {
        title_userId: { title, userId },
      },
    });
  }

  create(createCardDto: CreateCardDto, userId: number) {
    const cardTypes = createCardDto.type;

    delete createCardDto.type;

    return this.prisma.card.create({
      data: {
        ...createCardDto,
        userId,
        CardType: {
          connect: cardTypes.map((id) => ({
            id,
          })),
        },
      },
      select: {
        id: true,
        title: true,
        number: true,
        owner: true,
        cvv: true,
        expiration: true,
        password: true,
        userId: true,
        CardType: {
          select: {
            type: true,
          },
        },
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.card.findMany({
      where: { userId },
      include: {
        CardType: {
          select: { type: true },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.card.findUnique({
      where: { id },
      include: {
        CardType: {
          select: { type: true },
        },
      },
    });
  }

  remove(id: number, userId: number) {
    return this.prisma.card.delete({ where: { id, userId } });
  }
}
