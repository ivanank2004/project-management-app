import { Controller, Res, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseIntPipe, } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiCookieAuth, } from '@nestjs/swagger';

@ApiTags('Tasks')
@ApiCookieAuth('nest_session')
@Controller('projects/:projectId/tasks')
@UseGuards(SessionAuthGuard)
export class TasksController {
    constructor(private tasksService: TasksService) { }

    // ================= CREATE =================
    @Post()
    @ApiOperation({ summary: 'Tambah task ke project' })
    async create(
        @Param('projectId', ParseIntPipe) projectId: number,
        @Body() dto: CreateTaskDto,
    ) {
        const tasks = await this.tasksService.create(projectId, dto);

        return {
            status: 'success',
            message: 'Task berhasil dibuat',
            data: tasks,
        };
    }

    // ================= READ ALL =================
    @Get()
    @ApiOperation({ summary: 'Ambil semua task dalam project' })
    async findAll(
        @Param('projectId', ParseIntPipe) projectId: number,
    ) {
        const tasks = await this.tasksService.findAll(projectId);

        return {
            status: 'success',
            message: 'Daftar task',
            data: tasks,
        };
    }

    // ================= READ ONE =================
    @Get(':taskId')
    @ApiOperation({ summary: 'Detail task' })
    async findOne(
        @Param('projectId', ParseIntPipe) projectId: number,
        @Param('taskId', ParseIntPipe) taskId: number,
    ) {
        const task = await this.tasksService.findOne(projectId, taskId);

        return {
            status: 'success',
            message: 'Detail task',
            data: task,
        };
    }

    // ================= UPDATE =================
    @Patch(':taskId')
    @ApiOperation({ summary: 'Update task' })
    async update(
        @Param('projectId', ParseIntPipe) projectId: number,
        @Param('taskId', ParseIntPipe) taskId: number,
        @Body() dto: UpdateTaskDto,
    ) {
        const task = await this.tasksService.update(projectId, taskId, dto);

        return {
            status: 'success',
            message: 'Task berhasil diperbarui',
            data: task,
        };
    }



    @Post(':taskId/edit')
    async updateFromPage(
        @Param('projectId', ParseIntPipe) projectId: number,
        @Param('taskId', ParseIntPipe) taskId: number,
        @Body() dto: UpdateTaskDto,
        @Res() res: Response,
    ) {
        await this.tasksService.update(projectId, taskId, dto);

        return res.redirect(
            `/projects-page/${projectId}/tasks?success=task_updated`,
        );
    }

    // ================= COMPLETE =================
    @Patch(':taskId/complete')
    @ApiOperation({ summary: 'Selesaikan task' })
    async complete(
        @Param('projectId', ParseIntPipe) projectId: number,
        @Param('taskId', ParseIntPipe) taskId: number,
    ) {
        const task = await this.tasksService.complete(projectId, taskId);

        return {
            status: 'success',
            message: 'Task ditandai selesai',
            data: task,
        };
    }

    // ================= UNCOMPLETE =================
    @Patch(':taskId/uncomplete')
    @ApiOperation({ summary: 'Batalkan status selesai task' })
    async uncomplete(
        @Param('projectId', ParseIntPipe) projectId: number,
        @Param('taskId', ParseIntPipe) taskId: number,
    ) {
        const task = await this.tasksService.uncomplete(projectId, taskId);

        return {
            status: 'success',
            message: 'Status task dikembalikan ke belum selesai',
            data: task,
        };
    }

    // ================= DELETE =================
    @Delete(':taskId')
    @ApiOperation({ summary: 'Hapus task' })
    async remove(
        @Param('projectId', ParseIntPipe) projectId: number,
        @Param('taskId', ParseIntPipe) taskId: number,
    ) {
        await this.tasksService.remove(projectId, taskId);

        return {
            status: 'success',
            message: 'Task berhasil dihapus',
            data: null,
        };
    }
}