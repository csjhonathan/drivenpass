import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({
    example: 'email@email.com',
    description: 'This field requires an email in a valid format!',
  })
  email: string;

  @ApiProperty({
    example: 'My Name',
    description: 'This field requires a name!',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: '@Passw0rd',
    description:
      'This field requires a strong password, with symbols, numbers, uppercase letters and special characters!',
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  password: string;
}
