import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { EventsModule } from '../events/events.module';
import { Reservation, ReservationSchema } from './entities/reservation.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reservation.name, schema: ReservationSchema }]),
    EventsModule,
  ],
  providers: [ReservationsService],
  controllers: [ReservationsController],
})
export class ReservationsModule {}
