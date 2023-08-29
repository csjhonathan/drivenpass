import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { CardRepository } from './card.repository';

@Module({
  controllers: [CardController],
  providers: [CardService, CardRepository],
})
export class CardModule {}
