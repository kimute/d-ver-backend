import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// @ObjectType():graphQl schema which automatically build schema
// @Entity():ORM insert into DB
// @InputType({isAbstract: true}) means that: not belongs to schema and use somewhere 
@InputType({isAbstract: true})
@ObjectType()
@Entity()
export class Restaurant{


    @PrimaryGeneratedColumn()
    @Field(() => Number)
    id: number

    @Field(() => String)
    @Column()
    @IsString()
    @Length(5)
    name: string;

    /*@Field(() => Boolean, { nullable: true})
    isGood?: boolean;*/
    @Field(() => Boolean, { nullable:true }) //for graphQL
    @Column({ default: true})
    @IsOptional()
    @IsBoolean()
    isVegan: boolean;

    @Field(() => String)
    @Column()
    @IsString()
    address: string;

}