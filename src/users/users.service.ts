import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private repo: Repository<User>,
    ) { }

    findByEmail(email: string) {
        return this.repo.findOne({ where: { email } });
    }

    async create(email: string, password: string) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = this.repo.create({
            email,
            password: hashedPassword,
        });

        return this.repo.save(user);
    }
}