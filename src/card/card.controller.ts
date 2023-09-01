import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { AuthenticatedUser } from '../protocols/protocols';
import { User } from '../decorators/user.decorator';
import { AuthGuard } from '../guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  create(
    @Body() createCardDto: CreateCardDto,
    @User() user: AuthenticatedUser,
  ) {
    const { id } = user;

    return this.cardService.create(createCardDto, id);
  }

  @Get()
  findAll(@User() user: AuthenticatedUser) {
    const { id } = user;

    return this.cardService.findAll(id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: string,
    @User() user: AuthenticatedUser,
  ) {
    const { id: userId } = user;

    return this.cardService.findOne(+id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: string,
    @User() user: AuthenticatedUser,
  ) {
    const { id: userId } = user;

    return this.cardService.remove(+id, userId);
  }
}
