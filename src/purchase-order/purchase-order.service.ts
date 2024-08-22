import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { items, OrderStatus } from 'src/database/schema/purchaseOrder.schema';
import { VendorsService } from 'src/vendors/vendors.service';
import { ObjectId } from 'mongodb';
@Injectable()
export class PurchaseOrderService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly vendorService: VendorsService,
  ) {}

  async createOrder(
    orderDate: string,
    items: items,
    quantity: number,
    issueDate: string,
    vendor_id: ObjectId,
    deliveryDate: string,
  ) {
    const poNumber = await this.vendorService.generateKey(15);
    await new this.databaseService.purchaseOrderModel({
      poNumber,
      vendor: vendor_id,
      orderDate: new Date(orderDate),
      deliveryDate: new Date(deliveryDate),
      items,
      quantity,
      status: OrderStatus.PENDING,
      issueDate: new Date(issueDate),
    }).save();
    return `Order created`;
  }

  async getPurchaseOrder(page: number, limit: number, vendor_id?: ObjectId) {
    const skip = (page - 1) * limit;
    if (vendor_id) {
      return await this.databaseService.purchaseOrderModel
        .find({ vendor: vendor_id })
        .skip(skip)
        .limit(limit)
        .exec();
    }
    return await this.databaseService.purchaseOrderModel
      .find()
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async getSinglePurchaseOrder(poNumber: string) {
    try {
      const order = await this.databaseService.purchaseOrderModel.findOne({
        poNumber,
      });
      if (!order) {
        throw new Error('PO number not found');
      }
      return order;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async deletePurchaseOrder(poid: string) {
    return await this.databaseService.purchaseOrderModel.findOneAndDelete({
      poNumber: poid,
    });
  }

  async validateDate(dateStr: string): Promise<boolean> {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }

  async updateAcknowledgedDate(date: Date, order_id: ObjectId) {
    const order =
      await this.databaseService.purchaseOrderModel.findById(order_id);
    if (!order) {
      throw new BadRequestException(`order not found`);
    }
    order.acknowledgmentDate = date;
    await order.save();

    const vendorOrders = await this.databaseService.purchaseOrderModel.find({
      vendor: order.vendor,
    });

    let totalDifference = 0;
    let count = vendorOrders.length;

    vendorOrders.forEach((order) => {
      if (order.issueDate && order.acknowledgmentDate) {
        const timeDifference = Math.abs(
          order.acknowledgmentDate.getTime() - order.issueDate.getTime(),
        );
        totalDifference += timeDifference;
      }
    });

    let avgTimeDifference = count > 0 ? totalDifference / count : 0;

    let avgTimeDifferenceInDays = avgTimeDifference / (1000 * 60 * 60 * 24);

    const vendor = await this.databaseService.vendorsModel.findById(
      order.vendor,
    );
    if (vendor) {
      vendor.averageResponseTime = avgTimeDifferenceInDays;
      await vendor.save();
    }

    return `updated`;
  }

  async updateOrder(date: Date, rating: number, poid: string) {
    const order = await this.databaseService.purchaseOrderModel.findOne({
      poNumber: poid,
    });
    if (!order) {
      throw new NotFoundException(`order not found`);
    }

    if(order.status!== OrderStatus.PENDING){
      throw new BadRequestException(`order status is not pending`)
    }

    order.deliveryDate = date;
    order.qualityRating = rating;
    order.status = OrderStatus.COMPLETED;

    await order.save();
    const vendor = await this.databaseService.vendorsModel.findById(
      order.vendor,
    );
    if (!vendor) throw new NotFoundException(`Vendor not found`);
    const countOrder =
      await this.databaseService.purchaseOrderModel.countDocuments({
        vendor: vendor._id,
      });

    const vendorOrder = await this.databaseService.purchaseOrderModel.find({
      vendor: vendor._id,
    });
    let sum = 0;
    let onTimeCount = 0;
    let completedCount = 0;
    let totalCount = vendorOrder.length;

    vendorOrder.forEach((order) => {
      sum += Number(order.qualityRating) || 0;

      const expectedDeliveryDate = order.deliveryDate;
      if (
        date &&
        expectedDeliveryDate &&
        order.deliveryDate <= expectedDeliveryDate
      ) {
        onTimeCount++;
      }
      if (order.status === OrderStatus.COMPLETED) {
        completedCount++;
      }
    });

    let avg = totalCount > 0 ? sum / totalCount : 0;
    vendor.qualityRatingAvg = avg;

    let onTimeDeliveryRate =
      totalCount > 0 ? (onTimeCount / totalCount) * 100 : 0;
    vendor.onTimeDeliveryRate = onTimeDeliveryRate;

    let fulfillmentRate =
      totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    vendor.fulfillmentRate = fulfillmentRate;

    await vendor.save();
    return `updated`;
  }
}
