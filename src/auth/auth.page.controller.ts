import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller()
export class AuthPageController {

    @Get('/login')
    loginPage(@Req() req: Request, @Res() res: Response) {
        if (req.session.userId) {
            const backUrl = req.headers.referer || '/projects-page';
            return res.redirect(backUrl);
        }

        return res.render('login');
    }

    @Get('/register')
    registerPage(@Req() req: Request, @Res() res: Response) {
        if (req.session.userId) {
            const backUrl = req.headers.referer || '/projects-page';
            return res.redirect(backUrl);
        }

        return res.render('register');
    }
}