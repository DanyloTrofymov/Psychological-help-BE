import { sign, verify } from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;

export function generateAccessToken(userId) {
  return sign({ id: userId, type: 'access' }, jwtSecret, { expiresIn: "15m" });
}
export function generateRefreshToken(userId) {
  return sign({ id: userId, type: 'refresh' }, jwtSecret, { expiresIn: "7d" });
}

export function verifyToken(token) {
  return verify(token, jwtSecret);
}
