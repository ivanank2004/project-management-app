// src/auth/auth.page.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class AuthPageController {
    @Get('/login')
    loginPage(@Res() res: Response) {
        return res.render('login');
    }
}