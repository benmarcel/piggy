import { z } from 'zod';

export const createPenSchema = z.object({
  name: z.string().min(1, 'Pen name is required'),
  capacity: z.number().int().positive('Capacity must be a whole positive number'),
});

export const updatePenSchema = createPenSchema.partial();

export type CreatePenInput = z.infer<typeof createPenSchema>;
export type UpdatePenInput = z.infer<typeof updatePenSchema>;