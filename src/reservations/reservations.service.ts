import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventsService } from '../events/events.service';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
    private readonly eventsService: EventsService,
  ) {}

  async create(userId: string, dto: CreateReservationDto): Promise<Reservation> {
    const reservation = new this.reservationModel({
      userId,
      eventId: dto.eventId,
      reservedAt: new Date(),
    });
    await this.eventsService.updateReservation(dto.eventId);
    return reservation.save();
  }

  async findByUser(userId: string): Promise<Reservation[]> {
    return this.reservationModel.find({ userId });
  }

  async delete(reservationId: string, userId: string): Promise<{ message: string }> {
    const reservation = await this.reservationModel.findById(reservationId);
  
    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada');
    }
  
    if (reservation.userId !== userId) {
      throw new UnauthorizedException('No tienes permiso para eliminar esta reserva');
    }
  
    await reservation.deleteOne();
    return { message: 'Reserva eliminada exitosamente' };
  }
}