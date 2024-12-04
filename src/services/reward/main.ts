import { REWARD_DURATION, REWARD_LENDS, REWARD_PENALTY } from "@/constant"
import { Reward } from "@prisma/client"
import { generateSignature } from "../ethers/signature"
import {
  createReward,
  getRewardById,
  getUserRewards,
  updateClaimedAmount,
  updateRewardAmount,
  updateRewardEndDate,
} from "../prisma/reward"
import { getUserByAddress, getUserById } from "../prisma/user"

interface RewardContext {
  mainIO: any
  socketId: string
}

export class RewardService {
  private context: RewardContext
  private rewardIntervalId: NodeJS.Timeout | null = null
  private rewardId: string | null = null

  constructor(context: RewardContext) {
    this.context = context
  }

  start = async (userId: string, nodeId: string) => {
    const { mainIO, socketId } = this.context

    const reward = await createReward(userId, nodeId)
    this.rewardId = reward.id

    this.rewardIntervalId = setInterval(async () => {
      const rewardId = this.rewardId
      if (!rewardId) return

      const reward = await getRewardById(rewardId)
      if (!reward) throw new Error("Reward not found")

      const now = new Date()
      const startDate = reward.startDate

      const rewardLendId = reward.node.rewardLendId
      const rewardLend = REWARD_LENDS.find((r) => r.id === rewardLendId)
      if (!rewardLend) throw new Error("Invalid lend period")

      const lendPeriod = rewardLend.lendPeriod
      const rewardPeriod = now.getTime() - startDate.getTime()
      const isMultiply = rewardPeriod > lendPeriod
      const rewardAmount = isMultiply
        ? rewardLend.amount * rewardLend.multiply
        : rewardLend.amount

      await updateRewardAmount(rewardId, rewardAmount)

      console.log("Add Reward: ", socketId)
      mainIO.to(socketId).emit("BMAIN: REWARD", {
        message: `You have received ${rewardAmount} reward token!`,
      })
    }, REWARD_DURATION)
  }

  end = async (userId: string) => {
    if (!this.rewardIntervalId) return
    clearInterval(this.rewardIntervalId)
    this.rewardIntervalId = null

    const rewardId = this.rewardId
    if (!rewardId) return

    const reward = await getRewardById(rewardId)

    if (!reward) throw new Error("Reward not found")

    const startDate = reward.startDate
    const endDate = new Date()

    const rewardLendId = reward.node.rewardLendId
    const rewardLend = REWARD_LENDS.find((r) => r.id === rewardLendId)
    if (!rewardLend) throw new Error("Invalid lend period")

    const lendPeriod = rewardLend.lendPeriod
    const rewardPeriod = endDate.getTime() - startDate.getTime()
    const isPenalty = rewardPeriod < lendPeriod
    const rewardAmount = isPenalty
      ? reward.amount * REWARD_PENALTY
      : reward.amount

    await updateRewardEndDate(rewardId, rewardAmount, endDate)

    if (isPenalty) {
      console.log(`Penalty for userId ${userId} due to short lend period.`)
    }
    this.rewardId = null
  }
}

export const getUserTotalReward = async (userId: string) => {
  const rewards = await getUserRewards(userId)

  const amountToClaim = rewards.reduce(
    (amt: number, reward: Record<string, any>) => {
      const rewardLendId = reward.node.rewardLendId
      const rewardLend = REWARD_LENDS.find((r) => r.id === rewardLendId)
      if (!rewardLend) throw new Error("Invalid lend period")

      const now = new Date()
      const startDate = reward.startDate

      const lendPeriod = rewardLend.lendPeriod
      const rewardPeriod = now.getTime() - startDate.getTime()
      const isValid = reward.endDate || rewardPeriod > lendPeriod

      const unclaimedAmount = isValid ? reward.amount - reward.claimedAmount : 0
      return amt + unclaimedAmount
    },
    0
  )

  return amountToClaim
}

export const claimUserReward = async (userId: string) => {
  const user = await getUserById(userId)
  if (!user) throw new Error("user not found")

  const rewards = await getUserRewards(userId)
  const amountToClaim = rewards.reduce(
    (amt: number, reward: Record<string, any>) => {
      const rewardLendId = reward.node.rewardLendId
      const rewardLend = REWARD_LENDS.find((r) => r.id === rewardLendId)
      if (!rewardLend) throw new Error("Invalid lend period")

      const now = new Date()
      const startDate = reward.startDate

      const lendPeriod = rewardLend.lendPeriod
      const rewardPeriod = now.getTime() - startDate.getTime()
      const isValid = reward.endDate || rewardPeriod > lendPeriod

      const unclaimedAmount = isValid ? reward.amount - reward.claimedAmount : 0
      return amt + unclaimedAmount
    },
    0
  )

  if (!amountToClaim)
    throw new Error("Reward must be greater than zero to claim.")

  return await generateSignature(
    user.publicAddress,
    amountToClaim,
    user.rewardNonce
  )
}

export const updateClaimReward = async (address: string, amount: string) => {
  const user = await getUserByAddress(address)
  if (!user) throw new Error("User not found.")
  const rewards = await getUserRewards(user.id)
  let remainingAmount = parseFloat(amount)

  const rewardsWithEndDate = rewards.filter(
    (reward: Reward) => reward.amount > reward.claimedAmount && reward.endDate
  )
  for (const reward of rewardsWithEndDate) {
    const unclaimedAmount = reward.amount - reward.claimedAmount
    const amountToClaim = Math.min(unclaimedAmount, remainingAmount)
    remainingAmount -= amountToClaim
    await updateClaimedAmount(reward.id, reward.claimedAmount + amountToClaim)
    if (remainingAmount <= 0) break
  }

  if (remainingAmount > 0) {
    const rewardsWithoutEndDate = rewards.filter(
      (reward: Reward) =>
        reward.amount > reward.claimedAmount && !reward.endDate
    )
    for (const reward of rewardsWithoutEndDate) {
      const unclaimedAmount = reward.amount - reward.claimedAmount
      const amountToClaim = Math.min(unclaimedAmount, remainingAmount)
      remainingAmount -= amountToClaim
      await updateClaimedAmount(reward.id, reward.claimedAmount + amountToClaim)
      if (remainingAmount <= 0) break
    }
  }
}
