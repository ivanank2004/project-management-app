import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        example: 'admin@mail.com',
    })
    @IsEmail({}, { message: 'Format email tidak valid' })
    email: string;

    @ApiProperty({
        example: 'password123',
    })
    @IsNotEmpty({ message: 'Password wajib diisi' })
    password: string;
}