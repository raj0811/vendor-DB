import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vendors, VendorsDocument } from './schema/vendors.schema';
import { PurchaseOrder, PurchaseOrderDocument } from './schema/purchaseOrder.schema';
import { Admin, AdminDocument } from './schema/admin.schema';
@Injectable()
export class DatabaseService {
    constructor(
        @InjectModel(Vendors.name)
        public vendorsModel:Model<VendorsDocument>,
        @InjectModel(PurchaseOrder.name)
        public purchaseOrderModel: Model<PurchaseOrderDocument>,
        @InjectModel(Admin.name)
        public adminModel: Model<AdminDocument>,
    
    ){}
}
