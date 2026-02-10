import { Controller, Get, Param, Render, UseGuards, ParseIntPipe, } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ProjectsService } from '../projects/projects.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';

@UseGuards(SessionAuthGuard)
@Controller('projects-page/:projectId/tasks')
export class TasksPageController {
    constructor(
        private readonly tasksService: TasksService,
        private readonly projectsService: ProjectsService,
    ) { }

    // ===================== TASK LIST PAGE =====================
    @Get()
    @Render('tasks')
    async index(
        @Param('projectId', ParseIntPipe) projectId: number,
    ) {
        const project = await this.projectsService.findOne(projectId);
        const tasks = await this.tasksService.findAll(projectId);

        return {
            title: `Project - ${project.nama}`,
            projectId: project.id,
            projectName: project.nama,
            projectDescription: project.deskripsi,
            projectDate: project.date,
            completedAt: project.completedAt,
            isProjectCompleted: project.isCompleted,
            tasks,
        };
    }

    // ===================== CREATE PAGE =====================
    @Get('create')
    @Render('tasks-create')
    async createPage(
        @Param('projectId', ParseIntPipe) projectId: number,
    ) {
        const project = await this.projectsService.findOne(projectId);

        return {
            title: 'Tambah Task',
            projectId: project.id,
            projectName: project.nama,
        };
    }

    // ===================== EDIT PAGE =====================
    @Get(':taskId/edit')
    @Render('tasks-edit')
    async editPage(
        @Param('projectId', ParseIntPipe) projectId: number,
        @Param('taskId', ParseIntPipe) taskId: number,
    ) {
        const project = await this.projectsService.findOne(projectId);
        const task = await this.tasksService.findOne(projectId, taskId);

        return {
            title: 'Edit Task',
            projectId: project.id,
            projectName: project.nama,
            task,
        };
    }
}