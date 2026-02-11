import { IsNotEmpty, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
    @ApiProperty({
        example: 'Aplikasi Aktivitas Harian',
        description: 'Nama project',
    })
    @IsNotEmpty({ message: 'Nama project wajib diisi' })
    @MaxLength(100, { message: 'Nama project maksimal 100 karakter' })
    nama: string;

    @ApiPropertyOptional({
        example: 'Project untuk mencatat aktivitas harian pengguna',
    })
    @IsOptional()
    @MaxLength(100, { message: 'Deskripsi project maksimal 100 karakter' })
    deskripsi?: string;

    @ApiPropertyOptional({
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    isCompleted?: boolean;
}