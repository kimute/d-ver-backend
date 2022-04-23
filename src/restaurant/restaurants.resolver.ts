
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateReataurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver()
export class RestaurantResolver {
    constructor(private readonly restaurantService: RestaurantService){}
    /*@Query(() => Boolean)
    isPizzaGood(): boolean{
      return true;
    }*/
    @Query(() => [Restaurant])
    reataurant(): Promise<Restaurant[]>{
       
        return this.restaurantService.getAll();
    }
    //reataurant(@Args('veganOnly') veganOnly: boolean): -> moved to service.ts

    @Mutation(() => Boolean)
    async createReataurant(
        @Args('input') createReataurantDto: CreateReataurantDto
    ): Promise<boolean>{
        try {
            await this.restaurantService.createRestaurant(createReataurantDto);
            return true;
        } catch (e) {
            console.log(e)
            return false;
            
        }
    }
    
    // below  need  dto.ts in this case  UpdateResDto needed 
    @Mutation(() => Boolean)
    async updateRestaurant(@Args('input') updateRestaurantDto: UpdateRestaurantDto) :Promise<boolean>{
        try {
            await this.restaurantService.updateRestaurant(updateRestaurantDto);
            return true
        } catch (e) {
            return false;
        }
        
    }

}