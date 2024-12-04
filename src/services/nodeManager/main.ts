// import { generateKeyPair } from "@/utils/keygen"
import { generateRandomString } from "@/utils"
import { getNodeById, updateLendedNode } from "../prisma/node"
import { saveTransaction } from "../prisma/transaction"
import { getUserById, updateBalance } from "../prisma/user"
import { emitLendNode } from "../socketio/emmiter"
// import { saveKeyPair } from "../prisma/instance"


export const lendNodeGpu = async (userId: string, nodeId: string, duration: number) => {
    const node = await getNodeById(nodeId)
    const user = await getUserById(userId)

    if (!node) throw new Error("Node not found")
    if (!user) throw new Error("User not found")

    if (node.status !== "idle") {
        throw new Error("Node is not available")
    }
    if (!node.isConnected || !node.socketId) {
        throw new Error("Node is not connected")
    }
    if (!user.sshPublicKey) {
        throw new Error("User does not have SSH public key")
    }
    // const keys = generateKeyPair("user@host.com")

    // const savedKey = await saveKeyPair(userId, node.id, keys)

    const neededCredits = node.price * duration;
    if (user.balance < neededCredits) {
        throw new Error("Insufficient balance");
    }
    await updateBalance(userId, "MINUS", neededCredits);


    await saveTransaction({
        txHash: "0x00000" + (generateRandomString(10)),
        from: userId,
        to: node.id,
        value: neededCredits,
        type: "lend",
        status: "success"
    }, userId)

    await updateLendedNode(userId, node.id, duration)

    emitLendNode(node.socketId, {
        publicKey: user.sshPublicKey,
        username: userId
    })

    return {
        node
    }

}