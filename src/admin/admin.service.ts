import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Vendors } from 'src/database/schema/vendors.schema';
@Injectable()
export class AdminService {
  constructor(private databaseService: DatabaseService) {}
  async createAdmin(name: string, email: string, password: string) {
    const checkAdmin = await this.databaseService.adminModel.findOne({ email });
    if (checkAdmin) {
      throw new ConflictException(`Admin already exist with email ${email}`);
    }
    return await new this.databaseService.adminModel({
      name,
      email,
      password_hash: password,
    }).save();
  }

  async loginAdmin(email: string, password: string) {
    const admin = await this.databaseService.adminModel.findOne({ email });
    if (!admin) {
      throw new Error('Admin not found');
    }
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = {
      id: admin._id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET_FOR_VENDOR);
    return token;
  }

  async validateAdmintoken(token: string) {
    try {
      const decodedPayload = jwt.verify(
        token,
        process.env.JWT_SECRET_FOR_VENDOR,
      );

      const admin = await this.databaseService.adminModel.findById(
        decodedPayload.id,
      );

      if (!admin) {
        throw new UnauthorizedException('Invalid token');
      }
      const user = {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      };

      return user;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getAllVendors(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return await this.databaseService.vendorsModel
      .find()
      .select('-password_hash -__v')
      .skip(skip)
      .limit(limit)
      .exec();
  }

  
}
