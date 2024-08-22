import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { VendorsService } from './vendors.service';
import { VendorsGuard } from './vendors.guard';
import mongoose, { Types } from 'mongoose';
import { Vendors } from 'src/database/schema/vendors.schema';
import { PurchaseOrderService } from 'src/purchase-order/purchase-order.service';
@Controller('vendors')
export class VendorsController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly vendorService: VendorsService,
    private readonly purchaseService: PurchaseOrderService,
  ) {}

  @Post('/')
  async createVendor(
    @Body()
    body: {
      name: string;
      contactDetails: string;
      address: string;
      email: string;
      password: string;
    },
  ): Promise<String> {
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
  async loginVendor(@Body() body: { email: string; password: string }) {
    const token = await this.vendorService.loginVendorandGenrateToken(
      body.email,
      body.password,
    );
    return token;
  }
  @UseGuards(VendorsGuard)
  @Get('/')
  async getVendorData(@Req() req: any): Promise<Vendors> {
    const vendor_id = req.user.id;
    return this.vendorService.getVendorData(new Types.ObjectId(vendor_id));
  }

  @UseGuards(VendorsGuard)
  @Get('/update-acknowledged-date/:order_id')
  async updateAcknowledgedDate(
    @Param('order_id') order_id: string,
    @Body()
    body: {
      date: string;
    },
  ) {
    if (!this.purchaseService.validateDate(body.date)) {
      throw new BadRequestException(
        'Invalid date format. Dates must be in ISO 8601 format.',
      );
    }
    return this.purchaseService.updateAcknowledgedDate(
      new Date(body.date),
      new Types.ObjectId(order_id),
    );
  }

  @UseGuards(VendorsGuard)
  async updateOrder(){}

}
