import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vendors, VendorsSchema } from './schema/vendors.schema';
import {
  PurchaseOrder,
  PurchaseOrderSchema,
} from './schema/purchaseOrder.schema';
import { DatabaseService } from './database.service';
import { Admin } from 'mongodb';
import { AdminSchema } from './schema/admin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vendors.name, schema: VendorsSchema }]),
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    MongooseModule.forFeature([
      { name: PurchaseOrder.name, schema: PurchaseOrderSchema },
    ]),
  ],
  providers: [DatabaseService],
  exports: [
    DatabaseService,
    MongooseModule.forFeature([{ name: Vendors.name, schema: VendorsSchema }]),
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    MongooseModule.forFeature([
      { name: PurchaseOrder.name, schema: PurchaseOrderSchema },
    ]),
  ],
})
export class DatabaseModule {}
