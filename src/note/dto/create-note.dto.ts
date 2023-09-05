import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'My Note Title',
    description:
      'This field requires a title to your note, thats must be unique!',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget libero nec odio vestibulum malesuada....',
    description:
      'This field requires text to your note, with must length thats you whant!',
  })
  text: string;
}
