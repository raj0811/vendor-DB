import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { ObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: true })
  name: String;

  @Prop({ required: true })
  email: String;

  @Prop({})
  password_hash: String;
}

export type AdminDocument = Admin & Document;
export const AdminSchema = SchemaFactory.createForClass(Admin);

// bcrypt code for hashing password salt = 10
AdminSchema.pre('save', async function (next) {
  const admin: any = this;

  if (!admin.isModified('password_hash')) {
    return next();
  }

  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(admin.password_hash, saltRounds);

    admin.password_hash = hash;
    next();
  } catch (error) {
    return next(error);
  }
});
