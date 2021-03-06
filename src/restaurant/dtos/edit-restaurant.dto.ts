import { Field, InputType, ObjectType, PartialType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { CreateReataurantInput } from "./create-restaurant.dto";


@InputType()
export class EditRestaurantInput extends PartialType(CreateReataurantInput){
    @Field(() => Number)
    restaurantId: number;
}

@ObjectType()
export class EditRestaurantOutput extends CoreOutput{}