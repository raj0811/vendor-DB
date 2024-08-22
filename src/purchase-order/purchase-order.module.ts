import { Module } from '@nestjs/common';
import { PurchaseOrderController } from './purchase-order.controller';
import { PurchaseOrderService } from './purchase-order.service';
import { DatabaseModule } from 'src/database/database.module';
import { VendorsModule } from 'src/vendors/vendors.module';

@Module({
  imports:[DatabaseModule,VendorsModule],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
  exports:[PurchaseOrderModule,PurchaseOrderService]
})
export class PurchaseOrderModule {}
