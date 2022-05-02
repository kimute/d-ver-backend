import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserResolver } from './users.resolver';
import { UserService } from './users.service';

@Module({
    // ConfigService for using env like jwt
    imports: [TypeOrmModule.forFeature([User, Verification])],
    providers:[UserResolver, UserService],
    exports: [UserService]
})
export class UsersModule {}
