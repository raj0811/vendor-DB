import { Module } from '@nestjs/common';
import { VendorsGuard } from './vendors.guard';
import { VendorsService } from './vendors.service';
import { DatabaseService } from 'src/database/database.service';
import { DatabaseModule } from 'src/database/database.module';
import { PurchaseOrderModule } from 'src/purchase-order/purchase-order.module';
import { PurchaseOrderService } from 'src/purchase-order/purchase-order.service';
import { VendorsController } from './vendors.controller';
import { AdminModule } from 'src/admin/admin.module';

@Module({
    imports:[DatabaseModule],
    providers:[VendorsService,VendorsGuard],
    controllers:[],
    exports:[VendorsService,VendorsGuard]
})
export class VendorsModule {
}
