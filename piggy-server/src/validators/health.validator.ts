// src/validators/health.validator.ts
import { z } from 'zod';

export const createHealthSchema = z.object({
  pigId:   z.string().min(1, 'Pig is required'),
  type:    z.enum(['VACCINATION', 'DEWORMING', 'TREATMENT', 'CHECKUP', 'FOLLOWUP']),
  notes:   z.string().optional(),
  dueDate: z.coerce.date().optional(),
});

export const markHealthDoneSchema = z.object({
  doneAt: z.coerce.date().default(() => new Date()),
});

export type CreateHealthInput = z.infer<typeof createHealthSchema>;
export type MarkHealthDoneInput = z.infer<typeof markHealthDoneSchema>;