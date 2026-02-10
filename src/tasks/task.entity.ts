import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { Project } from '../projects/project.entity';

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    nama: string;

    @Column({ type: 'text', nullable: true })
    deskripsi?: string;

    @Column({ default: false })
    isCompleted: boolean;

    @CreateDateColumn()
    date: Date;

    @Column({ type: 'datetime', nullable: true })
    completedAt: Date | null;

    @ManyToOne(() => Project, (project) => project.tasks, {
        onDelete: 'CASCADE',
    })
    project: Project;
}