import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseIntPipe, } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { ApiTags, ApiOperation, ApiCookieAuth, } from '@nestjs/swagger';

@ApiTags('Projects')
@ApiCookieAuth('nest_session')
@Controller('projects')
@UseGuards(SessionAuthGuard)
export class ProjectsController {
    constructor(private projectsService: ProjectsService) { }

    // ================= CREATE =================
    @Post()
    @ApiOperation({ summary: 'Buat project baru' })
    async create(@Body() dto: CreateProjectDto) {
        const project = await this.projectsService.create(dto);

        return {
            status: 'success',
            message: 'Project berhasil dibuat',
            data: project,
        };
    }

    // ================= READ ALL =================
    @Get()
    @ApiOperation({ summary: 'Ambil semua project' })
    async findAll() {
        const projects = await this.projectsService.findAll();

        return {
            status: 'success',
            message: 'Daftar project',
            data: projects,
        };
    }

    // ================= READ ONE =================
    @Get(':id')
    @ApiOperation({ summary: 'Detail project' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const project = await this.projectsService.findOne(id);

        return {
            status: 'success',
            message: 'Detail project',
            data: project,
        };
    }

    // ================= UPDATE =================
    @Patch(':id')
    @ApiOperation({ summary: 'Update project' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProjectDto,
    ) {
        const project = await this.projectsService.update(id, dto);

        return {
            status: 'success',
            message: 'Project berhasil diperbarui',
            data: project,
        };
    }

    // ================= COMPLETE =================
    @Patch(':id/complete')
    @ApiOperation({ summary: 'Selesaikan project' })
    async complete(@Param('id', ParseIntPipe) id: number) {
        await this.projectsService.complete(id);

        return {
            status: 'success',
            message: 'Project berhasil diselesaikan',
        };
    }

    // ================= UNCOMPLETE =================
    @Patch(':id/uncomplete')
    @ApiOperation({ summary: 'Batalkan status selesai project' })
    async uncomplete(@Param('id', ParseIntPipe) id: number) {
        const project = await this.projectsService.uncomplete(id);

        return {
            status: 'success',
            message: 'Status project dikembalikan ke belum selesai',
            data: project,
        };
    }

    // ================= DELETE =================
    @Delete(':id')
    @ApiOperation({ summary: 'Hapus project' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.projectsService.remove(id);

        return {
            status: 'success',
            message: 'Project berhasil dihapus',
            data: null,
        };
    }
}
