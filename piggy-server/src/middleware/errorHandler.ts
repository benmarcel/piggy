import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const statusCode = (err instanceof AppError) ? err.statusCode : 500;
    const message = err.message || "Internal Server Error";
    
    // console.error(err); // Log the error for debugging purposes remember to remove this in production or use a proper logging library
    console.error(err);
    res.status(statusCode).json({
        success: false,
        message,
    });
}