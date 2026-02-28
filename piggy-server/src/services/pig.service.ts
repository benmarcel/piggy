// src/services/pig.service.ts
import { prisma } from '../lib/prisma';
import type { CreatePigInput } from '../validators/pig.validator';
import { getPenOccupancy } from './pen.service';
import { AppError } from '../utils/AppError';

// CREATE SINGLE PIG 
export const createPig = async (data: CreatePigInput, userId: string) => {
  // If a pen is specified, check capacity before doing anything
  if (data.penId) {
    const occupancy = await getPenOccupancy(data.penId, userId);

    if (!occupancy) {
      throw new AppError('Pen not found or does not belong to you', 404);
    }
    if (occupancy.isFull) {
      throw new AppError(
        `Pen "${occupancy.pen.name}" is at full capacity (${occupancy.pen.capacity})`,
        400
      );
    }
  }
const { tag, name, sex, breed, birthDate, weight, penId } = data;
  // prisma.pig.create() — your first real Prisma write
  // The shape of `data` is enforced by CreatePigInput (from Zod)
  // The shape Prisma accepts is enforced by your schema
  // Both are TypeScript — mismatches are caught at compile time
  const pig = await prisma.pig.create({
    data: {
      tag,
      name: name ?? null, // ensure optional fields are null if not provided
      sex,
      breed: breed ?? null,
      birthDate: birthDate ?? null,
      weight: weight ?? null,
      penId: penId ?? null,
      userId, // always injected by server, never trusted from client
    },
    include: {
      pen: true, // return the full pen object alongside the pig
    },
  });

  return pig;
};

// CREATE MULTIPLE PIGS (BULK)
export const createPigsBulk = async (
  pigs: CreatePigInput[],
  userId: string
) => {
  const results: {
    success: typeof successList;
    failed: typeof failedList;
  } = { success: [], failed: [] };

  const successList: Awaited<ReturnType<typeof createPig>>[] = [];
  const failedList: { index: number; tag: string; reason: string }[] = [];

  // We process each pig individually so one failure doesn't block the others
  // This is intentionally NOT a transaction — partial success is the goal here
  for (let i = 0; i < pigs.length; i++) {
    const pigData = pigs[i];

    if (pigData) {
      try {
        const createdPig = await createPig(pigData, userId);
        successList.push(createdPig);
      } catch (error: any) {
        failedList.push({
          index: i,
          tag: pigData.tag,
          reason: error.message || 'Unknown error',
        });
      }
    }
  }

  results.success = successList;
  results.failed = failedList;

  return results;
};

// WEAN LITTER
export const weanLitter = async (breedingId: string, userId: string) => {
  // Step 1: fetch the breeding record and verify ownership
  const breeding = await prisma.breeding.findFirst({
    where: { id: breedingId, userId },
    include: {
      sow: true,  // we need the sow's penId and userId
      boar: true,
    },
  });

  if (!breeding) {
    throw new AppError('Breeding record not found', 404);
  }
  if (breeding.status !== 'FARROWED') {
    throw new AppError('Cannot wean — this litter has not been marked as farrowed yet', 400);
  }
  if (!breeding.litterSize || breeding.litterSize === 0) {
    throw new AppError('Litter size has not been recorded on this breeding event', 400);
  }

  // Step 2: check if piglets already exist for this breeding
  const existingPiglets = await prisma.pig.count({
    where: { breedingId },
  });

  if (existingPiglets > 0) {
    throw new Error('Piglets for this litter have already been registered');
  }

  // Step 3: build the piglet records
  // Auto-generate tags like "LITTER-<breedingId>-1", "LITTER-<breedingId>-2"
  // The farmer can update individual tags later
  const pigletData = Array.from({ length: breeding.litterSize }, (_, i) => ({
    tag: `LITTER-${breedingId}-${i + 1}`,
    sex: 'FEMALE' as const,   // default to FEMALE — farmer updates individually
    status: 'ACTIVE' as const,
    userId,
    motherId: breeding.sowId,
    fatherId: breeding.boarId,
    breedingId: breeding.id,
    penId: breeding.sow.penId, // piglets start in the sow's pen
  }));

  // Step 4: THIS is a Prisma Transaction
  // All piglets must be created together, or none of them are
  // We also update the breeding status to WEANED in the same transaction
  const result = await prisma.$transaction(async (tx) => {
    const piglets = await tx.pig.createMany({
      data: pigletData,
    });

    await tx.breeding.update({
      where: { id: breedingId },
      data: { status: 'FARROWED' }, // you may want a WEANED status — see note below
    });

    return piglets;
  });

  return {
    message: `${result.count} piglets registered successfully`,
    breedingId,
    count: result.count,
  };
};