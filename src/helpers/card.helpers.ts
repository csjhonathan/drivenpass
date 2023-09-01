import { Card } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { CreateCardDto } from '../card/dto/create-card.dto';

@Injectable()
export class CardHelpers {
  private Cryptr = require('cryptr');
  private crypter: any;

  constructor() {
    this.crypter = new this.Cryptr(process.env.CRYPTR_SECRET);
  }

  encryptCard(card: CreateCardDto): CreateCardDto {
    return {
      ...card,
      password: this.crypter.encrypt(card.password),
      cvv: this.crypter.encrypt(card.cvv),
    };
  }

  decryptCard(card: Card): Card {
    return {
      ...card,
      password: this.crypter.decrypt(card.password),
      cvv: this.crypter.decrypt(card.cvv),
    };
  }
}
