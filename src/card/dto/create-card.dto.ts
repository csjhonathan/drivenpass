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
    return 'Card number must have 16 digits!';
  }
}

@ValidatorConstraint({ name: 'isCvvCardNumber', async: false })
export class IsCardCvv implements ValidatorConstraintInterface {
  validate(value: string) {
    return value?.length === 3;
  }

  defaultMessage() {
    return 'Card cvv number must have 3 digits!';
  }
}

@ValidatorConstraint({ name: 'isExpirationDate', async: false })
export class IsCardExpiration implements ValidatorConstraintInterface {
  validate(value: string) {
    const dateRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
    return dateRegex.test(value);
  }

  defaultMessage() {
    return 'Expiration date must have format "MM/YYYY"!';
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
    return 'Type must be a number or a list of numbers!';
  }
}

export class CreateCardDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumberString()
  @Validate(IsCardString)
  number: string;

  @IsNotEmpty()
  @IsString()
  owner: string;

  @IsNotEmpty()
  @IsNumberString()
  @Validate(IsCardCvv)
  cvv: string;

  @IsNotEmpty()
  @IsString()
  @Validate(IsCardExpiration)
  expiration: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @Validate(IsNumberArray)
  type: number[];
}
