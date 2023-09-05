import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateCredentialDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'My Credential Title',
    description:
      'This field requires a title to your credential, thats must be unique!',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  @ApiProperty({
    example: 'https://instagram.com',
    description: 'This field requires a valid url to your credential!',
  })
  url: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '@myUserName',
    description: 'This field requires a username to your credential!',
  })
  username: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '@MyInstagramPassword',
    description:
      'This field requires a password to your credential, this data will be encrypted by the api!',
  })
  password: string;
}
