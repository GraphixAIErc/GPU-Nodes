import { ethers } from "ethers"

export async function generateSignature(
  userAddress: string,
  amount: number,
  nonce: number
): Promise<{
  amount: number
  nonce: number
  timestamp: number
  signature: string
}> {
  const timestamp = Math.floor(Date.now() / 1000)

  const privateKey = process.env.WALLET_PRIVATE_KEY

  if (!privateKey) {
    throw new Error("Private key is not set")
  }

  const wallet = new ethers.Wallet(privateKey)

  const amountInWei = ethers.parseUnits(amount.toString(), 18)

  const message = ethers.solidityPackedKeccak256(
    ["address", "uint256", "uint256", "uint256"],
    [userAddress, amountInWei, nonce, timestamp]
  )

  const signature = await wallet.signMessage(ethers.getBytes(message))

  return { amount, nonce, timestamp, signature }
}
