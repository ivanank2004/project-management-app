import { Param, Controller, Get, Res, UseGuards, Post, Body, ParseIntPipe } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import type { Response } from 'express';
import { ProjectsService } from './projects.service';
import { TasksService } from 'src/tasks/tasks.service';

@Controller('projects-page')
@UseGuards(SessionAuthGuard)
export class ProjectsPageController {

    constructor(
        private readonly projectsService: ProjectsService,
        private readonly tasksService: TasksService,
    ) { }

    @Get()
    projectsPage(@Res() res: Response) {
        return res.render('projects');
    }

    @Get('create')
    createPage(@Res() res: Response) {
        return res.render('projects-create', {
            title: 'Buat Project',
        });
    }

    @Post('create')
    async handleCreate(
        @Body() body: any,
        @Res() res: Response,
    ) {
        try {
            const project = await this.projectsService.create({
                nama: body.name,
                deskripsi: body.description,
            });

            const titles: string[] = Array.isArray(body.tasks)
                ? body.tasks
                : body.tasks ? [body.tasks] : [];

            const descriptions: string[] = Array.isArray(body.taskDescriptions)
                ? body.taskDescriptions
                : body.taskDescriptions ? [body.taskDescriptions] : [];

            for (let i = 0; i < titles.length; i++) {
                const title = titles[i]?.trim();
                if (!title) continue;

                await this.tasksService.create(project.id, {
                    nama: title,
                    deskripsi: descriptions[i] || undefined,
                });
            }

            return res.redirect('/projects-page');

        } catch (err: any) {
            return res.status(400).render('projects-create', {
                title: 'Buat Project',
                error: err?.response?.message || err.message,
                fields: body,
            });
        }
    }

    // ================= EDIT PAGE =================
    @Get(':id/edit')
    async editPage(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: Response,
    ) {
        try {
            const [project, tasks] = await Promise.all([
                this.projectsService.findOne(id),
                this.tasksService.findAll(id),
            ]);

            return res.render('projects-edit', {
                title: 'Edit Project',
                project,
                tasks,
                backUrl: res.req.headers.referer || '/projects-page',
            });
        } catch {
            return res.redirect('/projects-page');
        }
    }
}