import { IsOptional, IsBoolean, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectDto {
    @ApiPropertyOptional({
        example: 'Aplikasi Aktivitas Harian (Update)',
    })
    @IsOptional()
    @IsNotEmpty({ message: 'Nama project tidak boleh kosong' })
    @MaxLength(100, { message: 'Nama project maksimal 100 karakter' })
    nama?: string;

    @ApiPropertyOptional({
        example: 'Deskripsi project diperbarui',
    })
    @IsOptional()
    @MaxLength(100, { message: 'Deskripsi project maksimal 100 karakter' })
    deskripsi?: string;

    @ApiPropertyOptional({
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isCompleted?: boolean;
}