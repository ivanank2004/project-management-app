import { IsOptional, IsBoolean, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskDto {
    @ApiPropertyOptional({
        example: 'Membuat halaman login (Update)',
    })
    @IsOptional()
    @IsNotEmpty({ message: 'Nama task tidak boleh kosong' })
    @MaxLength(100, { message: 'Nama task maksimal 100 karakter' })
    nama?: string;

    @ApiPropertyOptional({
        example: 'Tambahkan validasi dan error handling',
    })
    @IsOptional()
    @MaxLength(100, { message: 'Deskripsi task maksimal 100 karakter' })
    deskripsi?: string;

    @ApiPropertyOptional({
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isCompleted?: boolean;
}