import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { VendorsGuard } from './vendors.guard';
import { ObjectId } from 'mongodb';
import { Vendors } from 'src/database/schema/vendors.schema';
@Injectable()
export class VendorsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createVendor(
    name: string,
    contactDetails: string,
    address: string,
    email: string,
    password: string,
  ) {
    const findVendor = await this.databaseService.vendorsModel.findOne({
      email,
    });
    if (findVendor) {
      throw new ConflictException(`Vendor present with email ${email}`);
    }
    const vendorCode = await this.generateKey(10);
    const newVendor = new this.databaseService.vendorsModel({
      name,
      contactDetails,
      address,
      email,
      password_hash: password,
      vendorCode,
    });
    await newVendor.save();
    return `Vendor created successfully`;
  }

  async generateKey(keyLength: number) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let vendorCode;
    let isUnique = false;

    while (!isUnique) {
      vendorCode = '';

      for (let i = 0; i < keyLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        vendorCode += characters.charAt(randomIndex);
      }
      isUnique = await this.isKeyUnique(vendorCode);
    }
    return vendorCode;
  }

  async isKeyUnique(uniqueKey: string) {
    try {
      const checkKey = await this.databaseService.vendorsModel.findOne({
        vendorCode: uniqueKey,
      });
      return !checkKey;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async loginVendorandGenrateToken(
    email: string,
    password: string,
  ): Promise<string> {
    try {
      const vendor = await this.databaseService.vendorsModel.findOne({ email });
      if (!vendor) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const passwordMatch = await bcrypt.compare(
        password,
        vendor.password_hash,
      );

      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const payload = {
        id: vendor._id,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET_FOR_VENDOR);
      return token;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async validateVendorToken(token: string) {
    try {
      const decodedPayload = jwt.verify(
        token,
        process.env.JWT_SECRET_FOR_VENDOR,
      );
      console.log(decodedPayload);

      const vendor = await this.databaseService.vendorsModel.findById(
        decodedPayload.id,
      );
      if (!vendor) {
        throw new UnauthorizedException('Invalid token');
      }
      const user = {
        id: vendor._id,
        email: vendor.email,
        name: vendor.name,
      };
      return user;
    } catch (error) {
      console.log(error);

      throw new UnauthorizedException('Invalid token');
    }
  }

  async getVendorData(vendor_id: ObjectId): Promise<Vendors> {
    return await this.databaseService.vendorsModel
      .findById(vendor_id)
      .select('-password_hash -__v');
  }

  async updateVendorData(vendor_id: ObjectId,vendor: {
    name: string,
    contactDetails: string,
    address: string,
    email: string,
  }) {
    const update = await this.databaseService.vendorsModel.findByIdAndUpdate(
      vendor_id,
      { $set: vendor },
      { new: true },
    );
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
    return vendor;
  }

  async deleteVendor(vendor_id:ObjectId){
    const vendor = await this.databaseService.vendorsModel.findByIdAndDelete(vendor_id);
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
    return `Vendor deleted successfully`;
  }
}
