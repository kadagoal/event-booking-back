import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event, EventSchema } from './entities/event.entity';
import { Reflector } from '@nestjs/core';
import { CognitoAuthGuard } from 'src/common/auth/cognito-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
  ],
  controllers: [EventsController],
  providers: [EventsService, CognitoAuthGuard, Reflector],
  exports: [EventsService],
})
export class EventsModule {}