import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './project.entity';
import { ProjectsPageController } from './projects.page.controller';
import { TasksModule } from 'src/tasks/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    forwardRef(() => TasksModule),
  ],
  controllers: [
    ProjectsController,
    ProjectsPageController,
  ],
  providers: [
    ProjectsService,
  ],
  exports: [ProjectsService],
})
export class ProjectsModule { }
