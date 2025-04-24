import { Controller, Post, Body, UseGuards, Get, Req, Delete, Param } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CognitoAuthGuard } from '../common/auth/cognito-auth.guard';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
@UseGuards(CognitoAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async create(@Body() dto: CreateReservationDto, @Req() req) {
    return this.reservationsService.create(req.user.sub, dto);
  }

  @Get()
  async findByUser(@Req() req) {
    return this.reservationsService.findByUser(req.user.sub);
  }


  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req) {
    console.log("entrooo")
    return this.reservationsService.delete(id, req.user.sub);
  }

}