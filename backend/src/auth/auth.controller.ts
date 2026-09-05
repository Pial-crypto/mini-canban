import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import  { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { CurrentUser, type AuthUser } from './current-user.decorator.js';
import { RateLimit } from '../common/decorators/rate-limit.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
@RateLimit({
  limit: 5,
  windowMs: 60_000,
})
  @Post('register')
  register(@Body()  dto: RegisterDto) {
    return this.authService.register(dto);
  }
@RateLimit({
  limit: 5,
  windowMs: 60_000,
})
  @Post('login')
  login(@Body() dto: LoginDto) {
    // console.log('AuthController.login called with dto:', dto);
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.userId);
  }
}
