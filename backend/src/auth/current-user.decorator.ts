import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthUser {
  userId: string;
  email: string;
}

export const CurrentUser = createParamDecorator(

  (data: unknown, ctx: ExecutionContext): AuthUser => {
    console.log('CurrentUser decorator called');
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
