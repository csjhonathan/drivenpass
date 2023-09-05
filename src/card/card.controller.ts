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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CardHelpers } from '../helpers/card.helpers';

@ApiTags('cards')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register an card for user!' })
  @ApiBody({ type: CreateCardDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Your card is succesfully created!',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Sended card title is already in use in your collection!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Request body have invalid format or data!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The provided jwt token is invalid!',
  })
  create(
    @Body() createCardDto: CreateCardDto,
    @User() user: AuthenticatedUser,
  ) {
    const { id } = user;

    return this.cardService.create(createCardDto, id);
  }

  @Get('/types')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Provides a list with all card types in database!' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'You received a list with all card types or an empty array!',
    content: {
      'application/json': {
        example: {
          cardTypes: [
            CardHelpers.getCardTypeExample('Debit'),
            CardHelpers.getCardTypeExample('Credit'),
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The provided jwt token is invalid!',
  })
  findAllTypes() {
    return this.cardService.findAllCardTypes();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Provides a list with all user cards!' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'You received a list with all cards, or empty array if theres no exists cards!',
    content: {
      'application/json': {
        example: {
          cards: [
            CardHelpers.getCardExample(),
            CardHelpers.getCardExample(),
            CardHelpers.getCardExample(),
            CardHelpers.getCardExample(),
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The provided jwt token is invalid!',
  })
  findAll(@User() user: AuthenticatedUser) {
    const { id } = user;

    return this.cardService.findAll(id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Provides a unique card for that user!' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'You received one card by requested card id!',
    content: {
      'application/json': {
        example: {
          card: CardHelpers.getCardExample(),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The requested card not exists in database!',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'The requested card not existes in user collection',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The provided jwt token is invalid!',
  })
  findOne(
    @Param('id', ParseIntPipe) id: string,
    @User() user: AuthenticatedUser,
  ) {
    const { id: userId } = user;

    return this.cardService.findOne(+id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a unique card for that user!' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The requested card has been delete by card id',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The requested card not exists in database!',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'The requested card not existes in user collection',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The provided jwt token is invalid!',
  })
  remove(
    @Param('id', ParseIntPipe) id: string,
    @User() user: AuthenticatedUser,
  ) {
    const { id: userId } = user;

    return this.cardService.remove(+id, userId);
  }
}
