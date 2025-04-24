import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(@InjectModel(Event.name) private readonly eventModel: Model<Event>) {}

  async create(createEventDto: CreateEventDto, userId: string): Promise<Event> {
    const event = new this.eventModel({
      ...createEventDto,
      createdBy: userId,
      reservations: 0,
      soldPercentage: 0,
    });
    return event.save();
  }
  

  async findAll(): Promise<Event[]> {
    return this.eventModel.find();
  }

  async findByCreator(userId: string): Promise<Event[]> {
    return this.eventModel.find({ createdBy: userId });
  }

  async updateReservation(eventId: string): Promise<Event> {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new Error('Evento no encontrado');

    event.reservations += 1;
    event.soldPercentage = Math.round((event.reservations / event.attendeesCapacity) * 100);

    return event.save();
  }

  async update(eventId: string, updateData: Partial<CreateEventDto>): Promise<Event> {
    const updatedEvent = await this.eventModel.findByIdAndUpdate(
      eventId,
      updateData,
      { new: true },
    );
    if (!updatedEvent) throw new Error('Evento no encontrado');
    return updatedEvent;
  }
  async search(
    title?: string,
    category?: string,
    location?: string,
    startDate?: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Array<Record<string, any> & { availablePercentage: number; quantityAvailable: number }>; total: number }> {
    const filter: any = {};
  
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (category) filter.category = category;
    if (location) filter.location = location;
    if (startDate) filter.startDate = { $gte: new Date(startDate) };
  
    const skip = (page - 1) * limit;
  
    const [events, total] = await Promise.all([
      this.eventModel.find(filter).skip(skip).limit(limit),
      this.eventModel.countDocuments(filter),
    ]);
  
    const data = events.map((event) => {
      const plain = event.toObject();
      const quantityAvailable = Math.max(0, plain.attendeesCapacity - plain.reservations);
      const availablePercentage = Math.round((quantityAvailable / plain.attendeesCapacity) * 100);
  
      return {
        ...plain,
        quantityAvailable,
        availablePercentage,
      };
    });
  
    return { data, total };
  }
  }
