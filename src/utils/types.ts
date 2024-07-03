import { PrismaClient } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      userId?: number; // Define userId property on Request object
    }
  }
}

export interface Context {
  prisma: PrismaClient;
  userId?: number;
}