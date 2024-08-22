import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { DatabaseService } from 'src/database/database.service';
import { VendorsGuard } from 'src/vendors/vendors.guard';
import { items, OrderStatus } from 'src/database/schema/purchaseOrder.schema';
import mongoose, { Types } from 'mongoose';
@Controller('purchase-order')
export class PurchaseOrderController {
  constructor(
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly databaseService: DatabaseService,
  ) {}
  @UseGuards(VendorsGuard)
  @Post('/')
  async createOrder(
    @Req() req: any,
    @Body()
    body: {
      orderDate: string;
      items: items;
      quantity: number;
      issueDate: string;
      deliveryDate: string;
    },
  ) {
    const vendor_id = req.user.id;
    const { orderDate, items, quantity, issueDate, deliveryDate } = body;
    if (
      !this.validateDate(orderDate) ||
      !this.validateDate(issueDate) ||
      !this.validateDate(deliveryDate)
    ) {
      throw new BadRequestException(
        'Invalid date format. Dates must be in ISO 8601 format.',
      );
    }
    return await this.purchaseOrderService.createOrder(
      orderDate,
      items,
      quantity,
      issueDate,
      new Types.ObjectId(vendor_id),
      deliveryDate,
    );
  }

  async validateDate(dateStr: string): Promise<boolean> {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }

  
}
