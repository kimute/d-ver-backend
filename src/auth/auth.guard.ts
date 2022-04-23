import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";


@Injectable()
export class AuthGuard implements CanActivate {
    // this guard block(in case return false) all requests or not
    canActivate(context: ExecutionContext) {
        console.log(context);
        const gqlContext = GqlExecutionContext.create(context).getContext();
        const user = gqlContext['user']; // from req['user'] = user; 
        console.log(user);
        if(!user) {
            return false;
        }
        return true;
    }

}