import { z } from 'zod';

export const createPigSchema = z.object({
  tag: z.string().min(1, 'Tag is required'),
  name: z.string().nullish(),
  sex: z.enum(['MALE', 'FEMALE']),
  breed: z.string().nullish(),
  birthDate: z.coerce.date().nullish(), // coerce: turns "2024-01-01" string → Date object
  weight: z.number().positive('Weight must be a positive number').nullish(),
  penId: z.string().nullish(),          // client can optionally assign a pen on creation
});

export const updatePigSchema = createPigSchema.partial(); 
// .partial() makes ALL fields optional — perfect for PATCH requests

// These are the TypeScript types Zod generates for you automatically
export type CreatePigInput = z.infer<typeof createPigSchema>;
export type UpdatePigInput = z.infer<typeof updatePigSchema>;