import { Body, Controller, Get, Post, Headers, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRequest } from 'src/core/auth/dto/auth.request';
import { Public } from './decorators/public.decorator';
import { AuthResponse, CurrentUserResponse } from './dto/auth.response';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}
	// login and/or register using telegram

	@Post('signIn')
	@Public()
	async signIn(@Body() data: AuthRequest): Promise<AuthResponse> {
		return await this.authService.signIn(data);
	}

	@Get('refresh-token')
	@Public()
	async refresh(
		@Headers('Authorization') refresh: string
	): Promise<AuthResponse> {
		return await this.authService.refresh(refresh);
	}

	@Get('current-user')
	async currentUser(@Request() req): Promise<CurrentUserResponse> {
		return req.user;
	}
}
