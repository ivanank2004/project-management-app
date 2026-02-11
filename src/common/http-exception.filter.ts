import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Terjadi kesalahan pada server';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();

            if (typeof res === 'string') {
                message = res;
            } else if (typeof res === 'object' && res !== null) {
                const r = res as any;

                if (Array.isArray(r.message)) {
                    message = r.message.join(', ');
                } else if (typeof r.message === 'string') {
                    message = r.message;
                }
            }
        }

        const acceptHeader = request.headers.accept || '';
        const isApiRequest =
            acceptHeader.includes('application/json') ||
            (request.path.startsWith('/auth') && request.method === 'POST') ||
            (request.path.startsWith('/api'));

        if (isApiRequest) {
            return response.status(status).json({
                status: 'error',
                message: message,
                statusCode: status,
            });
        }

        const errorConfig = getErrorConfig(status);

        response.status(status).render('error', {
            statusCode: status,
            title: errorConfig.title,
            message: message || errorConfig.defaultMessage,
            icon: errorConfig.icon,
            iconColor: errorConfig.iconColor,
            headerGradient: errorConfig.headerGradient,
            headerBorder: errorConfig.headerBorder,
            textColor: errorConfig.textColor,
        });
    }
}

function getErrorConfig(status: number) {
    switch (status) {
        case 401:
            return {
                title: 'Unauthorized',
                defaultMessage: 'Anda harus login untuk mengakses halaman ini.',
                icon: 'lock',
                iconColor: 'text-red-500',
                headerGradient: 'from-red-50 to-red-100',
                headerBorder: 'border-red-200',
                textColor: 'text-red-500',
            };

        case 403:
            return {
                title: 'Akses Ditolak',
                defaultMessage: 'Anda tidak memiliki izin untuk mengakses halaman ini.',
                icon: 'shield-off',
                iconColor: 'text-orange-500',
                headerGradient: 'from-orange-50 to-orange-100',
                headerBorder: 'border-orange-200',
                textColor: 'text-orange-500',
            };

        case 404:
            return {
                title: 'Halaman Tidak Ditemukan',
                defaultMessage: 'Halaman yang Anda cari tidak tersedia atau sudah dipindahkan.',
                icon: 'file-question',
                iconColor: 'text-amber-500',
                headerGradient: 'from-amber-50 to-orange-50',
                headerBorder: 'border-amber-200',
                textColor: 'text-amber-500',
            };

        case 400:
            return {
                title: 'Permintaan Tidak Valid',
                defaultMessage: 'Data yang dikirim tidak valid.',
                icon: 'alert-circle',
                iconColor: 'text-orange-500',
                headerGradient: 'from-orange-50 to-orange-100',
                headerBorder: 'border-orange-200',
                textColor: 'text-orange-500',
            };

        default:
            return {
                title: 'Terjadi Kesalahan',
                defaultMessage: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
                icon: 'alert-triangle',
                iconColor: 'text-red-500',
                headerGradient: 'from-red-50 to-red-100',
                headerBorder: 'border-red-200',
                textColor: 'text-red-500',
            };
    }
}
