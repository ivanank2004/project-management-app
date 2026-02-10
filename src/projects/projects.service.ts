import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectRepo: Repository<Project>,
    ) { }

    async create(dto: CreateProjectDto) {
        const existing = await this.projectRepo.findOne({
            where: { nama: dto.nama },
        });

        if (existing) {
            throw new ConflictException({
                status: 'error',
                message: 'Nama project sudah digunakan',
            });
        }

        const project = this.projectRepo.create(dto);
        return this.projectRepo.save(project);
    }

    async findAll() {
        return this.projectRepo.find({
            order: { date: 'DESC' },
        });
    }

    async findOne(id: number) {
        const project = await this.projectRepo.findOne({
            where: { id },
        });

        if (!project) {
            throw new NotFoundException({
                status: 'error',
                message: 'Project tidak ditemukan',
            });
        }

        return project;
    }

    async update(id: number, dto: UpdateProjectDto) {
        const project = await this.findOne(id);

        if (dto.nama && dto.nama !== project.nama) {
            const existing = await this.projectRepo.findOne({
                where: { nama: dto.nama },
            });

            if (existing) {
                throw new ConflictException({
                    status: 'error',
                    message: 'Nama project sudah digunakan',
                });
            }
        }

        Object.assign(project, dto);
        return this.projectRepo.save(project);
    }

    async complete(id: number) {
        const project = await this.findOne(id);

        project.isCompleted = true;
        project.completedAt = new Date();

        return this.projectRepo.save(project);
    }

    async uncomplete(id: number) {
        const project = await this.findOne(id);

        project.isCompleted = false;
        project.completedAt = null;

        return this.projectRepo.save(project);
    }

    async remove(id: number) {
        const project = await this.findOne(id);
        await this.projectRepo.remove(project);
    }
}