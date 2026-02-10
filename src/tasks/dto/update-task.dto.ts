import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskDto {
    @ApiPropertyOptional({
        example: 'Membuat halaman login (Update)',
    })
    @IsOptional()
    nama?: string;

    @ApiPropertyOptional({
        example: 'Tambahkan validasi dan error handling',
    })
    @IsOptional()
    deskripsi?: string;

    @ApiPropertyOptional({
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isCompleted?: boolean;
}