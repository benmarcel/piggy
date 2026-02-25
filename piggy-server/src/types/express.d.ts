// src/types/express.d.ts

declare global {
  namespace Express {
    interface Request {
      // You can define exactly what the user object looks like
      user?: {
        userId: string;
      };
      
    }
  }
}

export {};