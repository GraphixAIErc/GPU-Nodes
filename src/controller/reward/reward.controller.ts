import {
  getRewardById,
  getRewardsByNodeId,
  getUserRewards,
} from "@/services/prisma/reward"
import { claimUserReward, getUserTotalReward } from "@/services/reward/main"
import { NextFunction, Request, Response } from "express"

class RewardController {
  public async getRewardById(req: Request, res: Response, next: NextFunction) {
    try {
      const rewardId = req.params.id

      if (!rewardId) throw new Error("rewardId not found")

      const reward = await getRewardById(rewardId)
      return res.status(200).send({ success: true, data: reward })
    } catch (err) {
      next(err)
      return
    }
  }

  public async getRewardsByNodeId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const nodeId = req.params.nodeId

      if (!nodeId) throw new Error("nodeId not found")

      const rewards = await getRewardsByNodeId(nodeId)
      return res.status(200).send({ success: true, data: rewards })
    } catch (err) {
      next(err)
      return
    }
  }

  public async getUserRewards(req: Request, res: Response, next: NextFunction) {
    try {
      const rewards = await getUserRewards(req.user.id)
      return res.status(200).send({ success: true, data: rewards })
    } catch (err) {
      next(err)
      return
    }
  }

  public async getUserTotalReward(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const totalReward = await getUserTotalReward(req.user.id)
      return res.status(200).send({ success: true, data: totalReward })
    } catch (err) {
      next(err)
      return
    }
  }

  public async claimUserReward(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const reward = await claimUserReward(req.user.id)
      return res.status(200).send({ success: true, data: reward })
    } catch (err) {
      next(err)
      return
    }
  }
}
export default RewardController
