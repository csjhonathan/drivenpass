import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '@Passw0rd',
    description:
      "This field requires a password, the one you previously registered, if you haven't registered, try to do it in the sign-up route",
  })
  password: string;
}
