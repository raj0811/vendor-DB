import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { DatabaseService } from 'src/database/database.service';
import { create } from 'domain';
import { AdminGuard } from './admin.guard';
import { Vendors } from 'src/database/schema/vendors.schema';
import { VendorsService } from 'src/vendors/vendors.service';
import mongoose, { Types } from 'mongoose';
import { PurchaseOrderService } from 'src/purchase-order/purchase-order.service';
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly databaseService: DatabaseService,
    private readonly vendorService: VendorsService,
    private readonly purchaseOrderService: PurchaseOrderService,
  ) {}

  @Post('/')
  async createAdmin(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
    },
  ) {
    const { name, email, password } = body;
    const admin = await this.adminService.createAdmin(name, email, password);
    return admin;
  }

  @UseGuards(AdminGuard)
  @Post('/vendors')
  async createVendor(
    @Body()
    body: {
      name: string;
      contactDetails: string;
      address: string;
      email: string;
      password: string;
    },
  ) {
    const { name, contactDetails, address, email, password } = body;
    if (!name || !contactDetails || !address || !email || !password) {
      throw new Error('Missing required fields');
    }
    return this.vendorService.createVendor(
      name,
      contactDetails,
      address,
      email,
      password,
    );
  }

  @Get('/login')
  async loginAdmin(@Body() body: { email: string; password: string }) {
    return await this.adminService.loginAdmin(body.email, body.password);
  }
  @UseGuards(AdminGuard)
  @Get('/vendors')
  async getAllVendors(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.adminService.getAllVendors(page, limit);
  }

  @UseGuards(AdminGuard)
  @Get('/vendors/:vendorid')
  async getAllVendorsById(@Param('vendorid') vendorId: string) {
    return await this.vendorService.getVendorData(new Types.ObjectId(vendorId));
  }

  @UseGuards(AdminGuard)
  @Put('/vendors/:vendorid')
  async updateVendor(
    @Param('vendorid') vendorId: string,
    @Body()
    body: {
      name: string;
      contactDetails: string;
      address: string;
      email: string;
    },
  ) {
    return await this.vendorService.updateVendorData(
      new Types.ObjectId(vendorId),
      body,
    );
  }

  @UseGuards(AdminGuard)
  @Delete('/vendors/:vendorid')
  async deleteVendor(@Param('vendorid') vendorId: string) {
    return await this.vendorService.deleteVendor(new Types.ObjectId(vendorId));
  }

  @UseGuards(AdminGuard)
  @Get('/purchase-order')
  async createPurchaseOrder(@Query() query: any) {
    const vendor_id = query.vendor_id || null;
    const page = query.page || 1;
    const limit = query.limit || 10;
    return this.purchaseOrderService.getPurchaseOrder(page, limit, vendor_id);
  }
  @UseGuards(AdminGuard)
  @Get('/purchase-order/:poid')
  async getSingleOrder(@Param('poid') purchaseOrderId: string) {
    try {
      return await this.purchaseOrderService.getSinglePurchaseOrder(
        purchaseOrderId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @UseGuards(AdminGuard)
  @Delete('/purchase-order/:poid')
  async deletePurchaseOrder(@Param('poid') purchaseOrderId: string) {
    return await this.purchaseOrderService.deletePurchaseOrder(purchaseOrderId);
  }

  @UseGuards(AdminGuard)
  @Post('/update-acknowledged-date/:order_id')
  async updateAcknowledgedDate(
    @Param('order_id') order_id: string,
    @Body()
    body: {
      date: string;
    },
  ) {
    if (!this.purchaseOrderService.validateDate(body.date)) {
      throw new BadRequestException(
        'Invalid date format. Dates must be in ISO 8601 format.',
      );
    }
    return this.purchaseOrderService.updateAcknowledgedDate(
      new Date(body.date),
      new Types.ObjectId(order_id),
    );
  }

  @UseGuards(AdminGuard)
  @Post('/mark-delivered/:poid')
  async updateOrder(
    @Param('poid') poid: string,
    @Body() body:{
    date: string,
    rating:number
  }){
    if (!this.purchaseOrderService.validateDate(body.date)) {
      throw new BadRequestException(
        'Invalid date format. Dates must be in ISO 8601 format.',
      );
    }

    if(body.rating > 5 || body.rating < 0){
      throw new BadRequestException('Invalid Rating ')
    }
    return await this.purchaseOrderService.updateOrder(new Date(body.date),body.rating,poid)
  }

  @UseGuards(AdminGuard)
  @Get('/get-metrics')
  async getMetrics(@Query() query: any) {
    const vendor_id = query.vendor_id || null;
    const vendor=await this.databaseService.vendorsModel.findById(vendor_id)
    return {
      onTimeDeliveryRate:vendor.onTimeDeliveryRate,
      qualityRatingAvg:vendor.qualityRatingAvg,
      averageResponseTime:vendor.averageResponseTime,
      fulfillmentRate:vendor.fulfillmentRate
    }
  }

}
