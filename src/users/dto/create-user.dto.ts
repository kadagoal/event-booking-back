import { IsEmail, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password_hash: string;

  @IsString()
  @IsIn(['admin', 'event_creator', 'user'])
  role: string;

  @IsOptional()
  @IsString()
  cellphone?: string;
}