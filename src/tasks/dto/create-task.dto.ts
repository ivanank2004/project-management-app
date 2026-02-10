import {
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsString,
    IsArray,
} from 'class-validator';

export class CreateTaskDto {
    @IsNotEmpty({ message: 'Nama task wajib diisi' })
    @IsString({ each: true })
    nama: string | string[];

    @IsOptional()
    @IsString({ each: true })
    deskripsi?: string | string[];

    @IsOptional()
    @IsBoolean()
    isCompleted?: boolean;
}