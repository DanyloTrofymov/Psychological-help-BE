import { UnauthorizedException } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { ACCESS_TOKEN, REFRESH_TOKEN } from 'src/data/constants';
import { INVALID_TOKEN } from 'src/data/messages';

const jwtSecret = process.env.JWT_SECRET;

export function generateAccessToken(userId) {
	return sign({ id: userId, type: ACCESS_TOKEN }, jwtSecret, {
		expiresIn: '15m'
	});
}
export function generateRefreshToken(userId) {
	return sign({ id: userId, type: REFRESH_TOKEN }, jwtSecret, {
		expiresIn: '7d'
	});
}

export function verifyToken(request) {
	try {
		const token = extractTokenFromHeader(request);
		return verify(token, jwtSecret);
	} catch (error) {
		throw new UnauthorizedException({
			message: INVALID_TOKEN,
			error: error.message,
			statusCode: 401
		});
	}
}

function extractTokenFromHeader(request: any): string | null {
	if (request && request.startsWith('Bearer ')) {
		return request.substring(7);
	}
	return null;
}
