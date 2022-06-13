import { Field, InputType, ObjectType, Int, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

//change ObjectType(in entity) to InputType
@InputType()
export class CreateReataurantInput extends PickType(Restaurant, [
  'name',
  'coverImg',
  'address',
]) {
  @Field(() => String)
  categoryName: string;
}

@ObjectType()
export class CreateReataurantOutput extends CoreOutput {
  @Field(() => Int)
  restaurantId?: number;
}
