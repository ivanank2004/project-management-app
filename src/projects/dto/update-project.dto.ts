import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectDto {
    @ApiPropertyOptional({
        example: 'Aplikasi Aktivitas Harian (Update)',
    })
    @IsOptional()
    nama?: string;

    @ApiPropertyOptional({
        example: 'Deskripsi project diperbarui',
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