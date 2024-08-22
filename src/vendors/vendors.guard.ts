import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { VendorsService } from './vendors.service';

@Injectable()
export class VendorsGuard implements CanActivate {
  constructor(private readonly vendorService: VendorsService) {}
  async canActivate(context: ExecutionContext): Promise<boolean | any> {
    const request = context.switchToHttp().getRequest();

    const extractTokenFromRequest = (req: any): string | null => {
      const authorizationHeader = req.headers?.authorization;
      return authorizationHeader?.startsWith('Bearer ')
        ? authorizationHeader.split(' ')[1]
        : null;
    };

    const validateToken = async (token: string): Promise<any | null> => {
      try {
        return await this.vendorService.validateVendorToken(token);
      } catch {
        return null;
      }
    };
    
    const token = extractTokenFromRequest(request);
    console.log(await validateToken(token),'test');
    if (!token || !(await validateToken(token))) {
      return false;
    }
    request.user = request.user || (await validateToken(token)).id;
    return !!request.user;
  }
}
