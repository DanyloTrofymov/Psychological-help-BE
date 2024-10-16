import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { subtle } from 'crypto';
import { AuthRequest } from 'src/core/auth/dto/auth.request';
import { AuthResponse } from './dto/auth.response';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import {
	generateAccessToken,
	generateRefreshToken,
	verifyToken
} from 'src/utils/jwt.helper';
import {
	DATA_OLD,
	INVALID_CREDENTIALS,
	INVALID_TOKEN
} from 'src/data/messages';
import { REFRESH_TOKEN } from 'src/data/constants';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(private readonly prismaService: PrismaService) {}

	async signIn(data: AuthRequest): Promise<AuthResponse> {
		if (data.auth_date < Date.now() / 1000 - 86400) {
			throw new UnauthorizedException({ message: DATA_OLD, statusCode: 401 });
		}
		const data_check_string = this.buildDataCheckString(data);

		const isVerified = await this.verifyTelegramData(
			data_check_string,
			data.hash,
			process.env.TELEGRAM_BOT_TOKEN
		);
		if (!isVerified) {
			throw new UnauthorizedException({
				message: INVALID_CREDENTIALS,
				statusCode: 401
			});
		}

		let avatarUrl: string | null = null;
		if (data.photo_url) {
			try {
				const response = await fetch(data.photo_url);
				if (response.status === 200) {
					avatarUrl = data.photo_url;
				}
			} catch (error) {
				console.error('Error fetching avatar:', error);
			}
		}

		const user = await this.prismaService.user.upsert({
			where: { id: data.id },
			update: {
				id: data.id,
				name: data.first_name,
				avatar: avatarUrl
					? {
							upsert: {
								create: { type: 'image', url: avatarUrl },
								update: { url: avatarUrl }
							}
						}
					: { disconnect: true }
			},
			create: {
				id: data.id,
				name: data.first_name,
				...(avatarUrl && {
					avatar: {
						create: { type: 'image', url: avatarUrl }
					}
				})
			}
		});
		const accessToken = generateAccessToken(user.id);
		const refreshToken = generateRefreshToken(user.id);

		return {
			accessToken,
			refreshToken
		};
	}

	async refresh(refresh: string): Promise<AuthResponse> {
		if (!refresh) {
			throw new UnauthorizedException({
				message: INVALID_TOKEN,
				statusCode: 401
			});
		}

		const payload = this.verifyAnyToken(refresh);

		if (
			!payload ||
			typeof payload !== 'object' ||
			payload.type !== REFRESH_TOKEN
		) {
			throw new UnauthorizedException({
				message: INVALID_TOKEN,
				statusCode: 401
			});
		}

		const accessToken = generateAccessToken(payload.id);
		const refreshToken = generateRefreshToken(payload.id);

		return {
			accessToken,
			refreshToken
		};
	}

	buildDataCheckString(data) {
		const sortedKeys = Object.keys(data).sort();
		const keyValuePairs = sortedKeys
			.filter(key => key !== 'hash')
			.filter(key => !!data[key])
			.map(key => `${key}=${data[key]}`);
		return keyValuePairs.join('\n');
	}

	async verifyTelegramData(dataCheckString, hash, botToken) {
		const encoder = new TextEncoder();
		const dataCheckStringBinary = encoder.encode(dataCheckString);
		const botTokenBinary = encoder.encode(botToken);

		const keyBuffer = await subtle.digest('SHA-256', botTokenBinary);
		const key = await subtle.importKey(
			'raw',
			keyBuffer,
			{ name: 'HMAC', hash: 'SHA-256' },
			false,
			['sign']
		);

		const signatureBuffer = await subtle.sign(
			'HMAC',
			key,
			dataCheckStringBinary
		);

		const signatureArray = new Uint8Array(signatureBuffer);
		const signatureHex = Array.from(signatureArray, byte =>
			byte.toString(16).padStart(2, '0')
		).join('');

		return signatureHex === hash;
	}

	verifyAnyToken(token: string) {
		const payload = verifyToken(token);

		if (
			!payload ||
			typeof payload !== 'object' ||
			payload.type !== REFRESH_TOKEN
		) {
			throw new UnauthorizedException({
				message: INVALID_TOKEN,
				statusCode: 401
			});
		}
		return payload;
	}
}
