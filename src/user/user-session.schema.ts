import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

@Schema()
export class UserSession extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    isRequired: true,
    unique: true,
  })
  user: Types.ObjectId; // Reference to User model

  @Prop({
    type: String,
    default: null,
  })
  hashedRefreshToken: string | null;

  @Prop({
    type: String,
    default: null,
  })
  deviceID: string | null;

  @Prop({
    type: String,
    default: null,
  })
  userAgent: string | null;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);
