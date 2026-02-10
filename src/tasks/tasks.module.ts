import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../projects/project.entity';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TasksPageController } from './tasks.page.controller';
import { ProjectsModule } from 'src/projects/projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Project]),
    forwardRef(() => ProjectsModule),
  ],
  controllers: [TasksController, TasksPageController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule { }
