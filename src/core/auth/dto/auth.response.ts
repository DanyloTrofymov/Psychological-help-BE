export interface AuthResponse {
	accessToken: string;
	refreshToken: string;
}

export interface CurrentUserResponse {
	id: number;
	name: string;
	createdAt: Date;
	updatedAt: Date;
	active: boolean;
	roleId: number;
	role: RoleResponse;
	avatarId: number;
	avatar: MediaResponse;
}

export interface MediaResponse {
	id: number;
	url: string;
	createdAt: Date;
	updatedAt: Date;
	type: string;
}

export interface RoleResponse {
	id: number;
	name: string;
	key: string;
	createdAt: Date;
	updatedAt: Date;
}
