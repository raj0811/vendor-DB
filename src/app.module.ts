import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VendorsController } from './vendors/vendors.controller';
import { VendorsService } from './vendors/vendors.service';
import { VendorsModule } from './vendors/vendors.module';
import { PurchaseOrderModule } from './purchase-order/purchase-order.module';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './admin/admin.module';
import { MetricsService } from './metrics/metrics.service';
import { MetricsController } from './metrics/metrics.controller';
import { MetricsModule } from './metrics/metrics.module';
config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB_URI),
    VendorsModule,
    PurchaseOrderModule,
    DatabaseModule,
    AdminModule,
    MetricsModule,
  ],
  controllers: [AppController, VendorsController, MetricsController],
  providers: [AppService, VendorsService, DatabaseService, MetricsService],
})
export class AppModule {}
