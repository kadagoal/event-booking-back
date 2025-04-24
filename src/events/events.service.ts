import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  private events: Event[] = [];

  findAll(): Event[] {
    return this.events;
  }

  create(createEventDto: CreateEventDto): Event {
    const newEvent: Event = {
      ...createEventDto,
      id: this.events.length + 1,
      startDate: new Date(createEventDto.startDate),
      endDate: new Date(createEventDto.endDate),
      reservations: 0,
      soldPercentage: 0,
      label: 'Últimas entradas',
    };
    this.events.push(newEvent);
    return newEvent;
  }
}