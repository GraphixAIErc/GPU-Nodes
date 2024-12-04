import rewardABI from "@/data/abi/reward.json"
import { ethers } from "ethers"
import { REWARD_ADDRESS } from "@/constant"
import { getEtherProvider } from "./main"
import { updateUserRewardNonce } from "../prisma/user"
import { updateClaimReward } from "../reward"

export const claimRewardEvent = () => {
  const provider = getEtherProvider()
  const contract = new ethers.Contract(REWARD_ADDRESS, rewardABI, provider)

  contract.on("RewardClaimed", async (address, amount, _) => {
    console.log("Claim Reward: ", `${address}, ${amount}`)

    await updateClaimReward(address, ethers.formatUnits(amount, 18))
    await updateUserRewardNonce(address)
  })
}
