import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileoutput } from './dtos/edit-profile.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => Boolean)
  hi() {
    return true;
  }

  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
    // try {
    //     const {ok,  error} = await this.usersService.createAccount(createAccountInput);
    //     return {
    //         ok,
    //         error
    //     };
    // } catch (error) {
    //     return {
    //         error,
    //         ok: false,
    //     };
    // }
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
    // try {
    //     return await this.usersService.login(loginInput);
    // } catch (error) {
    //     return{
    //         ok:false,
    //         error:error
    //     }
    // }
  }

  @UseGuards(AuthGuard) //protect endpoint
  @Query(() => User)
  me(@AuthUser() authUser: User) {
    console.log(authUser);
    return authUser;
  }

  //@UseGuards(AuthGuard)
  @Query(() => UserProfileOutput)
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    return this.usersService.findById(userProfileInput.userId);
    // try {
    //     const user = await this.usersService.findById(userProfileInput.userId);
    //     if(!user){
    //         throw Error();
    //     }
    //     return {
    //         ok: true,
    //         user,
    //     };
    // } catch (e) {
    //     return {
    //         error: 'User Not Found',
    //         ok: false,
    //     };
    // }
  }

  //@UseGuards(AuthGuard)
  @Mutation(() => EditProfileoutput)
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileoutput> {
    return this.usersService.editProfile(authUser.id, editProfileInput);
    // try {
    //     await this.usersService.editProfile(authUser.id, editProfileInput);
    //     return {
    //         ok: true,
    //     }
    // } catch (error) {
    //     return {
    //         ok: false,
    //         error
    //     }

    // }
  }

  //verify-email
  @Mutation(() => VerifyEmailOutput)
  async verifyEmail(
    @Args('input') verifyEmailInput: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(verifyEmailInput.code);
    // try {
    //     await this.usersService.verifyEmail(verifyEmailInput.code);
    //     return{
    //         ok:true
    //     }
    // } catch (error) {
    //     return {
    //         ok: false,
    //         error
    //     }
    // }
  }
}
