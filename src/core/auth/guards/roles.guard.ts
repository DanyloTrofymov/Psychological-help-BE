import {
	SetMetadata,
	UnauthorizedException,
	CanActivate,
	ExecutionContext,
	Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<string[] | string>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()]
		);

		if (!requiredRoles) {
			return true;
		}

		const rolesArray = Array.isArray(requiredRoles)
			? requiredRoles
			: [requiredRoles];

		const request = context.switchToHttp().getRequest<Request>();
		const user = (request as any)?.user;

		const isVerified = rolesArray.includes(user.role.key);
		if (!isVerified) {
			throw new UnauthorizedException('You do not have permission (Roles)');
		}
		return true;
	}
}

export const Roles = (roles: string | string[]) =>
	SetMetadata(ROLES_KEY, roles);
