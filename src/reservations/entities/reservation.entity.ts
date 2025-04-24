import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Reservation extends Document {
  @Prop({ required: true }) userId: string;
  @Prop({ required: true }) eventId: string;
  @Prop({ required: true }) reservedAt: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
