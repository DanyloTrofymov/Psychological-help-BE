import { SetMetadata } from '@nestjs/common';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()]
		);

		if (!requiredRoles) {
			return true;
		}

		const request = context.switchToHttp().getRequest<Request>();
		const user = (request as any)?.user;

		return requiredRoles.some(role => user.roles?.includes(role));
	}
}

export const Roles = (roles: string | string[]) =>
	SetMetadata(ROLES_KEY, roles);
