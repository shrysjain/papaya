import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'not_so_secret';

export const signToken = (user: User): string => {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
};

export const verifyToken = (token: string): { userId: number } => {
  return jwt.verify(token, JWT_SECRET) as { userId: number };
};