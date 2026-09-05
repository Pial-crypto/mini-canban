import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ) {
    console.log('JWT handleRequest');
    console.log('err:', err);
    console.log('user:', user);
    console.log('info:', info);

    return super.handleRequest(err, user, info, context, status);
  }
}