import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field(() => String) //for graphQL
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  coverImage: string;

  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  @Field(() => [Restaurant], { nullable: true })
  @OneToMany(() => Restaurant, (restaurants) => restaurants.category)
  restaurants: Restaurant[];
}
