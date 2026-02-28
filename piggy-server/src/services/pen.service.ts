
import {prisma} from '../lib/prisma';

export const getPenOccupancy = async (penId: string, userId: string) => {
    // The Inspector checks if "Barn A" belongs to you. (Yes).
    const pen = await prisma.pen.findFirst({
        where: {id: penId, userId}
    })

    if(!pen) return null;
    // The Inspector counts the pigs inside. He sees 8 active pigs.
    const numberOfPigs = await prisma.pig.count({
        where:{
            penId, status: 'ACTIVE'
        }
    })

    // The Report

    return{
        pen,
        currentCount: numberOfPigs,
        available: pen.capacity - numberOfPigs,
        isFull: numberOfPigs >= pen.capacity,
    }
}