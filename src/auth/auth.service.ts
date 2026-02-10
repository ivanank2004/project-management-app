// src/auth/auth.service.ts
import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) { }

    async register(email: string, password: string) {
        const existingUser = await this.usersService.findByEmail(email);

        if (existingUser) {
            throw new ConflictException({
                status: 'error',
                message: 'Email sudah terdaftar',
            });
        }

        return this.usersService.create(email, password);
    }

    async validateUser(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException({
                status: 'error',
                message: 'Email atau password salah',
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException({
                status: 'error',
                message: 'Email atau password salah',
            });
        }

        return user;
    }
}