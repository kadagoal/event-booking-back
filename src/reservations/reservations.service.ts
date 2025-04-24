import { Injectable } from '@nestjs/common';

@Injectable()
export class ReservationsService {
  create() {
    return 'Reservation created';
  }

  findAll() {
    return 'List of reservations';
  }
}