import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
} from 'typeorm';
import { Task } from '../tasks/task.entity';

@Entity()
export class Project {
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

    @OneToMany(() => Task, (task) => task.project, {
        cascade: true,
    })
    tasks: Task[];
}