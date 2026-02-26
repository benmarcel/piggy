// src/tests/__mocks__/prisma.ts
import { PrismaClient } from '@prisma/client';
import { mockDeep} from 'jest-mock-extended';
import type {DeepMockProxy } from 'jest-mock-extended';
import { jest } from '@jest/globals';

import {prisma} from '../../lib/prisma'; // Path to prisma client instance

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;