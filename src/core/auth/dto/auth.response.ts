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
  avatarId: number;
  Avatar: MediaResponse;
}

export interface MediaResponse {
  id: number;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  type: string;
}
