import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { INVALID_TOKEN, NO_TOKEN } from 'src/data/messages';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { verifyToken } from 'src/utils/jwt.helper';

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private prismaService: PrismaService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const IS_PUBLIC = 'is_public';
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
			context.getHandler(),
			context.getClass()
		]);

		// Proceed if it's a public route
		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		if (!token) {
			throw new UnauthorizedException({ message: NO_TOKEN, statusCode: 401 });
		}

		// Validate the token
		try {
			// Verify the token
			const payload = verifyToken(token);
			if (
				!payload ||
				typeof payload !== 'object' ||
				payload.type !== 'access'
			) {
				throw new UnauthorizedException({
					message: INVALID_TOKEN,
					statusCode: 401
				});
			}
			const user = await this.prismaService.user.findUnique({
				where: { id: payload.id },
				include: { Avatar: true }
			});

			if (!user) {
				throw new UnauthorizedException({
					message: INVALID_TOKEN,
					statusCode: 401
				});
			}

			request.user = user;

			return true;
		} catch (error) {
			throw new UnauthorizedException({
				message: INVALID_TOKEN,
				error: error.message,
				statusCode: 401
			});
		}
	}

	private extractTokenFromHeader(request: any): string | null {
		const authHeader = request.headers.authorization;
		if (authHeader && authHeader.startsWith('Bearer ')) {
			return authHeader.substring(7); // Extract the token itself
		}
		return null;
	}
}
