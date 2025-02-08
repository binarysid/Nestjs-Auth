import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({
    type: String,
    isRequired: true,
  })
  name: string;

  @Prop({
    type: String,
    isRequired: true,
  })
  email: string;

  @Prop({
    type: String,
    isRequired: true,
  })
  password: string;

  @Prop({
    type: String,
    default: null,
  })
  hashedRefreshToken: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
