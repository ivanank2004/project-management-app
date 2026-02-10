// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthPageController } from './auth.page.controller';

@Module({
  imports: [UsersModule],
  controllers: [AuthController, AuthPageController],
  providers: [AuthService]
})
export class AuthModule { }
