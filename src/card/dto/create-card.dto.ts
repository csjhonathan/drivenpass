import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isCardNumber', async: false })
export class IsCardString implements ValidatorConstraintInterface {
  validate(value: string) {
    return value?.length === 16;
  }

  defaultMessage() {
    return 'card number must have 16 digits!';
  }
}

@ValidatorConstraint({ name: 'isCvvCardNumber', async: false })
export class IsCardCvv implements ValidatorConstraintInterface {
  validate(value: string) {
    return value?.length === 3;
  }

  defaultMessage() {
    return 'card cvv number must have 3 digits!';
  }
}

@ValidatorConstraint({ name: 'isExpirationDate', async: false })
export class IsCardExpiration implements ValidatorConstraintInterface {
  validate(value: string) {
    const dateRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
    return dateRegex.test(value);
  }

  defaultMessage() {
    return 'expiration date must have format "MM/YYYY"!';
  }
}

@ValidatorConstraint({ name: 'isNumberOrArray', async: false })
export class IsNumberArray implements ValidatorConstraintInterface {
  validate(value: any) {
    if (
      Array.isArray(value) &&
      value.every((item) => typeof item === 'number')
    ) {
      return true;
    }
    return false;
  }

  defaultMessage() {
    return 'type must be a list of numbers!';
  }
}

export class CreateCardDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'My Card Title',
    description:
      'This field requires a title to your card, thats must be unique!',
  })
  title: string;

  @IsNotEmpty()
  @IsNumberString()
  @Validate(IsCardString)
  @ApiProperty({
    example: '1234567887654321',
    description:
      'This field requires a numeric string for card number to your card, thats must have a 16 digits without white spaces!',
  })
  number: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'John Doe',
    description: 'This field requires a owner name to your card!',
  })
  owner: string;

  @IsNotEmpty()
  @IsNumberString()
  @Validate(IsCardCvv)
  @ApiProperty({
    example: '123',
    description:
      'This field requires a numeric string for cvv card number to your card, thats must have a 3 digits without white spaces!',
  })
  cvv: string;

  @IsNotEmpty()
  @IsString()
  @Validate(IsCardExpiration)
  @ApiProperty({
    example: '03/2025',
    description: 'This field requires a date in YY/MMMM format!',
  })
  expiration: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '1234',
    description: 'This field requires a password to your card!',
  })
  password: string;

  @IsNotEmpty()
  @Validate(IsNumberArray)
  @ApiProperty({
    example: [1, 2],
    description: 'This field requires an array with cardTypeId for!',
  })
  type: number[];
}
