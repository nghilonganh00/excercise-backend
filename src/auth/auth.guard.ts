import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      request['userId'] = '97f9922b-6c10-49a8-bfad-0d1791006cfc';
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
