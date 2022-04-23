import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity } from "typeorm";
import * as bcrypt from "bcrypt";
import { InternalServerErrorException } from "@nestjs/common";
import { IsEmail, IsEnum } from "class-validator";

enum UserRole {
    client, 
    owner, 
    delivery 
};

//graphQL
registerEnumType(UserRole, { name: 'UserRole'});

@InputType({ isAbstract: true})
@ObjectType()
@Entity()
export class User extends CoreEntity{
    @Column()
    @Field(() => String)
    @IsEmail()
    email: string;

    @Column({select: false})
    @Field(() => String)
    password: string;

    @Column({ type: 'enum', enum: UserRole })
    @Field(() => UserRole)
    @IsEnum(UserRole)
    role: UserRole;

    @Column({ default: false })
    @Field(() => Boolean)
    verified: boolean;

    //check before insert
    @BeforeInsert()
    @BeforeUpdate() // this is for update
    async hashPassword(): Promise<void> {
        if(this.password){
            try {
                this.password = await bcrypt.hash(this.password, 10);
            } catch (e) {
                throw new InternalServerErrorException();
                
            }
        }
    }

    async checkPassword(givenPassword:string) : Promise<boolean>{
        try {
            const ok = await bcrypt.compare(givenPassword, this.password);
            return ok;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
            
        }
    }
}