import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { ObjectId } from 'mongoose';
import { Vendors } from './vendors.schema';

export enum OrderStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED',
  }
  

export class items{
    @Prop()
    itemName: String;
    @Prop()
    description: String;
    @Prop()
    price: Number;
}

@Schema({ timestamps: true })
export class PurchaseOrder {
  @Prop({ required: true, unique: true })
  poNumber: String;

  @Prop({
    required: true,
    ref: 'Vendors',
    type: mongoose.Schema.Types.ObjectId,
  })
  vendor: Vendors;

  @Prop({ required: true })
  orderDate: Date;

  @Prop({ required: true })
  deliveryDate: Date;

  @Prop({ required: true })
  items: items;

  @Prop({ required: true,default:OrderStatus.PENDING })
  status: OrderStatus;

  @Prop()
  qualityRating: Number;

  @Prop({ required: true })
  issueDate: Date;

  @Prop()
  acknowledgmentDate: Date;
}

export type PurchaseOrderDocument = PurchaseOrder & Document;
export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder);
