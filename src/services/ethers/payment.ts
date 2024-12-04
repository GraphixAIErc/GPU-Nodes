import { ethers } from "ethers";
import { getEtherProvider } from "./main";
import { ADMIN_ADDRESS, TOKEN_ADDRESS } from "@/constant";
import erc20Abi from "@/data/abi/erc20.json";




export const verifyPayment = async (txHash: string) => {
    const provider = await getEtherProvider();

    const [transaction, receipt] = await Promise.all([
        provider.getTransaction(txHash),
        provider.getTransactionReceipt(txHash)
    ]);

    if (!transaction || !receipt) {
        throw new Error("Transaction not found or receipt unavailable");
    }
    if (receipt.status === 0) {
        throw new Error("Transaction failed");
    }

    if (receipt.to?.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
        throw new Error("Payment not received by admin");
    }

    return {
        from: transaction.from,
        to: transaction.to,
        value: ethers.formatEther(transaction.value)
    };


}


export const verifyTokenPayment = async (txHash: string) => {
    const provider = await getEtherProvider();

    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
        throw new Error("Transaction not found");
    }
    if (receipt.status === 0) {
        throw new Error("Transaction failed")
    }

    if ((receipt.to)?.toLowerCase() !== TOKEN_ADDRESS.toLowerCase()) {
        throw new Error("in valid token address")
    }


    const erc20Interface = new ethers.Interface(erc20Abi);

    const transferEventSignature = ethers.id("Transfer(address,address,uint256)");
    const transferEvent = receipt.logs.find(log => log.topics[0] === transferEventSignature);
    if (!transferEvent) {
        throw new Error("No transfer event found in the transaction")
    }

    const decodedEvent = erc20Interface.decodeEventLog("Transfer", transferEvent.data, transferEvent.topics);

    const [from, to, value] = [
        decodedEvent[0],
        decodedEvent[1],
        decodedEvent[2].toString()
    ];

    if (to.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
        throw new Error("Payment not received by admin")
    }

    return {
        from,
        to,
        value
    }

}