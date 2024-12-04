import { disconnectNode, registerNode } from "@/services/prisma/node"


export const handleInitiateNode = async (socketId: string, userId: string, data: any) => {
    return await registerNode(socketId,userId, data)
}
export const handleDisconnect = async (socketId: string) => {
    return await disconnectNode(socketId)
}