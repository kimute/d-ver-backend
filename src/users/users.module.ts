import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
    // ConfigService for using env like jwt
    imports: [TypeOrmModule.forFeature([User, Verification])],
    providers:[UsersResolver, UsersService],
    exports: [UsersService]
})
export class UsersModule {}
