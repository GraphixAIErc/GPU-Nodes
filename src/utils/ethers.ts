import { ethers } from "ethers";


export function weiToEth(wei: string) {
    const eth = ethers.formatUnits(wei, 'ether');
    return Number(eth);
}