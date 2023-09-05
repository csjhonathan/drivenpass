import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({
    example: 'email@email.com',
    description:
      "This field requires an email in a valid format, use the email you previously registered, if you haven't registered, try to do it in the sign-up route",
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '@Passw0rd',
    description:
      "This field requires a password, the one you previously registered, if you haven't registered, try to do it in the sign-up route",
  })
  password: string;
}
