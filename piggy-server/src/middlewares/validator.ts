import type { Request, Response, NextFunction } from 'express';
// Swap ZodSchema for ZodType
import { ZodType } from 'zod';

export const validate =
  (schema: ZodType<any>, source: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    // We access the source dynamically: req['body'], req['query'], etc.
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      // Pass the error to your global error handler
      return next(result.error);
    }

    // Overwrite the original data with the validated/transformed data
    req[source] = result.data;
    next();
  };