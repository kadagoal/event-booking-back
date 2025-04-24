import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Event extends Document {
  @Prop() title: string;
  @Prop() category: string;
  @Prop() price: number;
  @Prop() startDate: Date;
  @Prop() endDate: Date;
  @Prop() location: string;
  @Prop() image: string;
  @Prop() attendeesCapacity: number;
  @Prop({ default: 0 }) reservations: number;
  @Prop({ default: 0 }) soldPercentage: number;
  @Prop() label: string;
}
export const EventSchema = SchemaFactory.createForClass(Event);
