import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password_hash: string;

  @Prop({ required: true, enum: ['admin', 'event_creator', 'user'] })
  role: string;

  @Prop({ required: false })
  cellphone?: string;

  @Prop()
  created_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

