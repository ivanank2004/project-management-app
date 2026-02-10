import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({
        example: 'admin@mail.com',
    })
    @IsEmail({}, { message: 'Format email tidak valid' })
    email: string;

    @ApiProperty({
        example: 'password123',
        minLength: 6,
    })
    @IsNotEmpty({ message: 'Password wajib diisi' })
    @MinLength(6, { message: 'Password minimal 6 karakter' })
    password: string;
}