import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { CardRepository } from './card.repository';
import { CardHelpers } from '../helpers/card.helpers';

@Injectable()
export class CardService {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly cardHelpers: CardHelpers,
  ) {}

  async create(createCardDto: CreateCardDto, userId: number) {
    const { title } = createCardDto;
    const card = await this.findOneByTitleAndUserId(title, userId);

    if (card) {
      throw new ConflictException(
        'This card title is already in use in your collection!',
      );
    }

    const data: CreateCardDto = this.cardHelpers.encryptCard(createCardDto);

    return this.cardRepository.create(data, userId);
  }

  async findAll(userId: number) {
    const cards = await this.cardRepository.findAll(userId);

    return cards.map((card) => this.cardHelpers.decryptCard(card));
  }

  async findOne(id: number, userId: number) {
    const card = await this.cardRepository.findOne(id);

    if (!card) {
      throw new NotFoundException('Card doesnt exists!');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException(
        'This card doesnt exists in your collection!',
      );
    }

    return this.cardHelpers.decryptCard(card);
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    return this.cardRepository.remove(id, userId);
  }

  private findOneByTitleAndUserId(title: string, userId: number) {
    return this.cardRepository.findOneByTitleAndUserId(title, userId);
  }
}
