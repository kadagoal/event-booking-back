import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Reservation extends Document {
  @Prop({ required: true }) userId: string;
  @Prop({ type: Types.ObjectId, ref: Event.name, required: true })
  eventId: Types.ObjectId;
  @Prop({ required: true }) reservedAt: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
