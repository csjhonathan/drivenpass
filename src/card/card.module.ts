import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { CardRepository } from './card.repository';
import { CardHelpers } from '../helpers/card.helpers';

@Module({
  controllers: [CardController],
  providers: [CardService, CardRepository, CardHelpers],
})
export class CardModule {}
