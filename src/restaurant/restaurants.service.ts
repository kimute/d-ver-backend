//this part can also in resolver

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateReataurantDto } from "./dtos/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dtos/update-restaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";


// here write somthig for DB
@Injectable()
export class RestaurantService{
    //get all from DB
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
    ){}
    getAll(): Promise<Restaurant[]>{
        return this.restaurants.find()
    }
    //from resolver
    createRestaurant(createReataurantDto: CreateReataurantDto): Promise<Restaurant>{
        const newRestaurant = this.restaurants.create(createReataurantDto);
        return this.restaurants.save(newRestaurant);
    }
    updateRestaurant({id, data}:UpdateRestaurantDto){
        return this.restaurants.update(id, {...data})
    }
}