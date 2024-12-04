import { prisma } from "../main";


export const saveTransaction = async (data: any, userId: string) => {
    return await prisma.transaction.create({
        data: {
            txHash: data.txHash,
            from: data.from,
            to: data.to,
            value: typeof data.value === 'number' ? data.value.toString() : data.value,
            type: data.type,
            status: data.status,
            userId: userId
        }
    });

}

export const fetchMyTransactions = async (userId: string) => {
    return await prisma.transaction.findMany({
        where: {
            userId: userId
        }
    });
}

export const fetchTransactionsByHash = async (txHash: string) => {
    const transaction = await prisma.transaction.findUnique({
        where: {
            txHash: txHash
        }
    });

    return transaction || null;
}
