// src/validators/breeding.validator.ts
import { z } from 'zod';

export const createBreedingSchema = z.object({
  sowId:       z.string().min(1, 'Sow is required'),
  boarId:      z.string().min(1, 'Boar is required'),
  serviceDate: z.coerce.date(),
  // Notice: NO expectedFarrowingDate here
  // The client never sends this — the server calculates it (serviceDate + 114 days)
}).refine(data => data.sowId !== data.boarId, {
  message: 'A pig cannot be bred with itself',
  path: ['boarId'],
});

export const recordFarrowingSchema = z.object({
  actualFarrowingDate: z.coerce.date(),
  litterSize: z.number().int().positive(),
});

export type CreateBreedingInput = z.infer<typeof createBreedingSchema>;
export type RecordFarrowingInput = z.infer<typeof recordFarrowingSchema>;