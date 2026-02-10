import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
    @ApiProperty({
        example: 'Aplikasi Aktivitas Harian',
        description: 'Nama project',
    })
    @IsNotEmpty({ message: 'Nama project wajib diisi' })
    nama: string;

    @ApiPropertyOptional({
        example: 'Project untuk mencatat aktivitas harian pengguna',
    })
    @IsOptional()
    deskripsi?: string;

    @ApiPropertyOptional({
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    isCompleted?: boolean;
}