import { ethers } from "ethers"
import { getEtherProvider } from "./main"
import { APP_NAME } from "@/constant/app";
import { getUser } from "../prisma/user";


export const verifyMessage = (nonce: number, signature: string) => {
    const message = `Please sign this message to connect to ${APP_NAME}(${nonce})`;
    return ethers.verifyMessage(message, signature)
}