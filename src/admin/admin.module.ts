import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AdminGuard } from './admin.guard';
import { VendorsModule } from 'src/vendors/vendors.module';
import { PurchaseOrderModule } from 'src/purchase-order/purchase-order.module';
import { PurchaseOrderService } from 'src/purchase-order/purchase-order.service';

@Module({
  imports:[DatabaseModule,VendorsModule,PurchaseOrderModule],
  providers: [AdminService,AdminGuard,PurchaseOrderService],
  controllers: [AdminController]
})
export class AdminModule {}
