export interface AuthRequest {
	auth_date: number;
	first_name?: string;
	last_name?: string;
	id: number;
	photo_url?: string;
	hash: string;
}
