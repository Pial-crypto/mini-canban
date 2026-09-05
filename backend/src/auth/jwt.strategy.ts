import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor() {
    console.log('JwtStrategy constructor called');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-json-secret',
    });
  }


  async validate(payload: JwtPayload) {
    console.log('JwtStrategy.validate', { payload });
    return { userId: payload.sub, email: payload.email };
  }
}
