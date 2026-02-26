import  jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import type { Request, Response, NextFunction } from "express";
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
   // Check if header exists and starts with Bearer
if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Please log in to get access.", 401));
}

const token = authHeader.split(" ")[1];

if (!token) {
    return next(new AppError("Authentication token is missing.", 401));
}

// Verify token
try {
    if (!process.env.JWT_SECRET) {
        throw new AppError("JWT_SECRET is not defined in environment variables", 500);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
    req.user = { userId: decoded.userId }; // Attach user info to request object
    next();
} catch (err) {
    return next(new AppError("Invalid or expired token.", 401));
}
}