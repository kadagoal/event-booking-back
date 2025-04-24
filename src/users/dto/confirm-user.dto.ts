import { IsEmail, IsString } from 'class-validator';

export class ConfirmUserDto {
  @IsEmail()
  email: string;

  @IsString()
  code: string;
}
