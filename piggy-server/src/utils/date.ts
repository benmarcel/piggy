// utils/date.ts
export const getExpiryDate = (hours: number): Date => {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
};