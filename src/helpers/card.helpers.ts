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

  static getCardExample() {
    return {
      id: 'Some id number',
      title: 'Some title',
      number: 'Some card number',
      owner: 'Some owner name for this card',
      cvv: 'Some cvv number',
      expiration: 'Some expiration date in',
      password: 'the password you use on the website you are saving',
      userId: 'Some user id',
      CardType: [{ type: 'Debit' }],
      createdAt: 'The date that card has been created!',
      updatedAt: 'The last date that card has been updated!',
    };
  }

  static getCardTypeExample(example: 'Debit' | 'Credit') {
    return {
      id: 'Some id number',
      type: example === 'Debit' ? 'Debit' : 'Credit',
      createdAt: 'The date that card type has been created!',
      updatedAt: 'The last date that card type has been updated!',
    };
  }
}
