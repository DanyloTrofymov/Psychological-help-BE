import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCESS_TOKEN } from 'src/data/constants';
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

		if (!request) {
			throw new UnauthorizedException({ message: NO_TOKEN, statusCode: 401 });
		}

		try {
			const payload = verifyToken(request.headers.authorization);
			if (
				!payload ||
				typeof payload !== 'object' ||
				payload.type !== ACCESS_TOKEN
			) {
				throw new UnauthorizedException({
					message: INVALID_TOKEN,
					statusCode: 401
				});
			}
			const user = await this.prismaService.user.findUnique({
				where: { id: payload.id },
				include: { avatar: true, role: true }
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
}
