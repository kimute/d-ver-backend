import { ArgsType, Field, InputType, PartialType } from "@nestjs/graphql";
import { CreateReataurantDto } from "./create-restaurant.dto";

@InputType()
export class UpdateRestaurantInputType extends PartialType(CreateReataurantDto) {}

@InputType()
export class UpdateRestaurantDto {
    @Field(() => Number)
    id: number;

    @Field(() => UpdateRestaurantInputType)
    data: UpdateRestaurantInputType;
}