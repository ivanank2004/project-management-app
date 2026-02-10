import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { Project } from '../projects/project.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private taskRepo: Repository<Task>,

        @InjectRepository(Project)
        private projectRepo: Repository<Project>,
    ) { }

    private async getProject(projectId: number): Promise<Project> {
        const project = await this.projectRepo.findOne({
            where: { id: projectId },
        });

        if (!project) {
            throw new NotFoundException({
                status: 'error',
                message: 'Project tidak ditemukan',
            });
        }

        return project;
    }

    async create(projectId: number, dto: CreateTaskDto) {
        const project = await this.getProject(projectId);

        const namesRaw = Array.isArray(dto.nama) ? dto.nama : [dto.nama];
        const descRaw = Array.isArray(dto.deskripsi)
            ? dto.deskripsi
            : namesRaw.map(() => dto.deskripsi);

        const tasks = namesRaw.map((_, i) =>
            this.taskRepo.create({
                nama: String(namesRaw[i]),
                deskripsi: descRaw?.[i]
                    ? String(descRaw[i])
                    : undefined,
                isCompleted: dto.isCompleted ?? false,
                project,
            } as Partial<Task>)
        );

        return this.taskRepo.save(tasks);
    }

    async findAll(projectId: number) {
        await this.getProject(projectId);

        return this.taskRepo.find({
            where: { project: { id: projectId } },
            order: { date: 'DESC' },
        });
    }

    async findOne(projectId: number, taskId: number) {
        await this.getProject(projectId);

        const task = await this.taskRepo.findOne({
            where: {
                id: taskId,
                project: { id: projectId },
            },
        });

        if (!task) {
            throw new NotFoundException({
                status: 'error',
                message: 'Task tidak ditemukan',
            });
        }

        return task;
    }

    async update(
        projectId: number,
        taskId: number,
        dto: UpdateTaskDto,
    ) {
        const task = await this.findOne(projectId, taskId);

        Object.assign(task, dto);
        return this.taskRepo.save(task);
    }

    async complete(projectId: number, taskId: number) {
        const task = await this.findOne(projectId, taskId);

        task.isCompleted = true;
        task.completedAt = new Date();

        return this.taskRepo.save(task);
    }

    async uncomplete(projectId: number, taskId: number) {
        const task = await this.findOne(projectId, taskId);

        task.isCompleted = false;
        task.completedAt = null;

        return this.taskRepo.save(task);
    }

    async remove(projectId: number, taskId: number) {
        const task = await this.findOne(projectId, taskId);
        await this.taskRepo.remove(task);
    }
}