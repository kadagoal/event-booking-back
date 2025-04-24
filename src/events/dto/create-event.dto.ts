import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateEventDto {
  @IsString() title: string;
  @IsString() category: string;
  @IsNumber() price: number;
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
  @IsString() location: string;
  @IsString() image: string;
  @IsNumber() attendeesCapacity: number;
  @IsString() label: string;
}