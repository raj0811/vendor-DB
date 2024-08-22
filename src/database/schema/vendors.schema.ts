import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { ObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Schema({ timestamps: true })
export class Vendors {
  @Prop({ required: true })
  name: String;

  @Prop({ required: true })
  email: String;

  @Prop({ required: true })
  contactDetails: String;

  @Prop({ required: true })
  address: String;

  @Prop({ required: true, unique: true })
  vendorCode: String;

  @Prop({ required: false, default: 0 })
  onTimeDeliveryRate: Number;

  @Prop({ required: false, default: 0 })
  qualityRatingAvg: Number;

  @Prop({ required: false, default: 0 })
  averageResponseTime: Number;

  @Prop({ required: false, default: 0 })
  fulfillmentRate: Number;

  @Prop({})
  password_hash: String;
}

export type VendorsDocument = Vendors & Document;
export const VendorsSchema = SchemaFactory.createForClass(Vendors);

// bcrypt code for hashing password salt = 10
VendorsSchema.pre('save', async function (next) {
  const vendor: any = this;

  if (!vendor.isModified('password_hash')) {
    return next();
  }

  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(vendor.password_hash, saltRounds);

    vendor.password_hash = hash;
    next();
  } catch (error) {
    return next(error);
  }
});
