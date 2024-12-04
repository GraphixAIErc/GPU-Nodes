
import { REWARD_LENDS } from '@/constant';
import { PrismaClient } from '@prisma/client';



const prisma = new PrismaClient();


export const fetchAllNodes = async () => {
    return await prisma.node.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });
}

export const fetchAllActiveNodes = async () => {
    return await prisma.node.findMany({
        where: {
            isConnected: true,
            status: "idle"
        }
    });
}

export const fetchMyNodes = async (userId: string) => {
    return await prisma.node.findMany({
        where: {
            ownerId: userId
        }
    });
}

export const fetchMyRentalNodes = async (userId: string) => {
    return await prisma.node.findMany({
        where: {
            rentedById: userId
        }
    });
}

export const fetchAllRentedNodes = async () => {
    return await prisma.node.findMany({
        where: {
            status: "lended",
        }
    });
}


export const registerNode = async (socketId: string, userId: string, data: any) => {
    //check if the node is already registered
    const existingNode = await prisma.node.findFirst({
        where: {
            name: data.node_name,
            ownerId: userId
        }
    });

    const rewardLendId = data.lend_period
    const rewardLend = REWARD_LENDS.find((r) => r.id === rewardLendId)

    if (!rewardLend)
        throw new Error('Invalid lend period')

    //update it if the data is new
    if (existingNode) {
        return await prisma.node.update({
            where: {
                id: existingNode.id
            },
            data: {
                isConnected: true,
                socketId: socketId,
                price: data.price,
                publicIp: data.public_ip,
                port: data.port,
                rewardLendId,
            }
        });
    }

    return await prisma.node.create({
        data: {
            name: data.node_name,
            gpu: data.gpu_info,
            cpu: data.cpu_info,
            storage: data.storage_info,
            status: "idle",
            isConnected: true,
            socketId: socketId,
            network: data.network_info,
            publicIp: data.public_ip,
            ownerId: userId,
            price: data.price,
            port: data.port,
            rewardLendId,
        }
    });
}

export const getNodeById = async (id: string) => {
    return await prisma.node.findUnique({
        where: {
            id
        }
    });
}


export const disconnectNode = async (socketId: string) => {
    try {
        const nodes = await prisma.node.findMany({
            where: {
                socketId: socketId
            }
        });

        if (nodes.length === 0) {
            return;
        }

        const updates = nodes.map((node: any) => {
            return prisma.node.update({
                where: { id: node.id },
                data: { isConnected: false, socketId: null },
            });
        });

        const results = await Promise.all(updates);
        return results;

    } catch (err) {
        console.log(err)
        return null
    }
}


// export const updateLendedNode = (nodeId: string, keyName: string, duration: number) => {
export const updateLendedNode = (userId: string, nodeId: string, duration: number) => {

    const expireAt = new Date();
    expireAt.setHours(expireAt.getHours() + duration);

    return prisma.node.update({
        where: {
            id: nodeId
        },
        data: {
            // keyName: keyName,
            rentedById: userId,
            status: "lended",
            expireAt: expireAt,
            startedAt: new Date()
        }
    });
}

export const updateRemoveRentedNode = (nodeId: string) => {
    return prisma.node.update({
        where: {
            id: nodeId
        },
        data: {
            status: "idle",
            rentedById: null,
            expireAt: null,
            startedAt: null
        }
    });
}

export const freeTheNode = async (socketId: string) => {
    try {
        const nodes = await prisma.node.findMany({
            where: {
                socketId: socketId
            }
        });

        if (nodes.length === 0) {
            return;
        }

        const updates = nodes.map((node: any) => {
            return prisma.node.update({
                where: { id: node.id },
                data: { status: 'idle' },
            });
        });

        const results = await Promise.all(updates);
        return results;
    } catch (err) {
        return []
    }
}

export const getAppropriateNode = async (pendingTask: any) => {

    const node = await prisma.node.findFirst({
        where: {
            isConnected: true,
            status: "idle"
        }
    });

    if (node) {
        await prisma.task.update({
            where: {
                id: pendingTask.id
            },
            data: {
                nodeId: node.id
            }
        });

        await prisma.node.update({
            where: {
                id: node.id
            },
            data: {
                status: "idle"

            }
        });
    }

    return node;
}

