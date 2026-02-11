import { Controller, Post, Body, Req, Get, BadRequestException, UnauthorizedException, } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiCookieAuth, } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // ================= REGISTER =================
    @Post('register')
    @ApiOperation({ summary: 'Registrasi user baru' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: 201, description: 'Registrasi berhasil' })
    async register(@Body() body: RegisterDto) {
        await this.authService.register(body.email, body.password);

        return {
            status: 'success',
            message: 'Registrasi berhasil',
            data: null,
        };
    }

    // ================= LOGIN =================
    @Post('login')
    @ApiOperation({ summary: 'Login user (session)' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'Login berhasil' })
    async login(
        @Body() body: LoginDto,
        @Req() req: Request,
    ) {
        const user = await this.authService.validateUser(
            body.email,
            body.password,
        );

        req.session['userId'] = user.id;

        return {
            status: 'success',
            message: 'Login berhasil',
            data: {
                userId: user.id,
            },
        };
    }

    // ================= LOGOUT =================
    @Post('logout')
    @ApiOperation({ summary: 'Logout user' })
    @ApiCookieAuth('nest_session')
    async logout(@Req() req: Request) {
        return new Promise((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) {
                    return reject(
                        new UnauthorizedException({
                            status: 'error',
                            message: 'Gagal logout',
                        }),
                    );
                }

                req.res?.clearCookie('nest_session');

                resolve({
                    status: 'success',
                    message: 'Logout berhasil',
                    data: null,
                });
            });
        });
    }

    // ================= ME =================
    @Get('me')
    @UseGuards(SessionAuthGuard)
    @ApiOperation({ summary: 'Cek user login' })
    @ApiCookieAuth('nest_session')
    me(@Req() req: Request) {
        if (!req.session['userId']) {
            throw new UnauthorizedException({
                status: 'error',
                message: 'Unauthorized',
            });
        }

        return {
            status: 'success',
            message: 'Authenticated user',
            data: {
                userId: req.session['userId'],
            },
        };
    }
}