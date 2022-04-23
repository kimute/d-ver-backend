import { InputType, OmitType } from "@nestjs/graphql";
import { IsBoolean, IsString, Length } from "class-validator";
import { Restaurant } from "../entities/restaurant.entity";

//change ObjectType(in entity) to InputType
@InputType()
export class CreateReataurantDto extends OmitType(
    Restaurant,
    ['id']
){}