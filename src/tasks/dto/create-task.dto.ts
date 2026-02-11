import {
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsString,
    IsArray,
    MaxLength,
} from 'class-validator';

export class CreateTaskDto {
    @IsNotEmpty({ message: 'Nama task wajib diisi' })
    @IsString({ each: true })
    @MaxLength(100, { message: 'Nama task maksimal 100 karakter', each: true })
    nama: string | string[];

    @IsOptional()
    @IsString({ each: true })
    @MaxLength(100, { message: 'Deskripsi task maksimal 100 karakter', each: true })
    deskripsi?: string | string[];

    @IsOptional()
    @IsBoolean()
    isCompleted?: boolean;
}