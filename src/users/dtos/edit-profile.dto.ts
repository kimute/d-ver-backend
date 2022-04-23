import { InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { User } from "../entities/user.entity";


@ObjectType()
export class EditProfileoutput extends CoreOutput{}


//PartialType make optional
@InputType()
export class EditProfileInput extends PartialType(
    PickType(User, ["email", "password"])
){}