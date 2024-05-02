import { UnauthorizedException } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { ACCESS_TOKEN, REFRESH_TOKEN } from 'src/data/constants';
import { INVALID_TOKEN } from 'src/data/messages';

const jwtSecret = process.env.JWT_SECRET;

export function generateAccessToken(userId) {
	return sign({ id: userId, type: ACCESS_TOKEN }, jwtSecret, {
		expiresIn: '1m'
	});
}
export function generateRefreshToken(userId) {
	return sign({ id: userId, type: REFRESH_TOKEN }, jwtSecret, {
		expiresIn: '7d'
	});
}

export function verifyToken(token) {
	try {
		return verify(token, jwtSecret);
	} catch (error) {
		throw new UnauthorizedException({
			message: INVALID_TOKEN,
			error: error.message,
			statusCode: 401
		});
	}
}
