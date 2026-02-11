import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class GuestOnlyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();

        if (request.session && request.session.userId) {
            return false;
        }

        return true;
    }
}