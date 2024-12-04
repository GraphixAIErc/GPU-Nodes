import { Router } from "express"
import { authenticateJwt } from "@/middleware"
import RewardController from "@/controller/reward/reward.controller"

const router = Router()
const rewardController: RewardController = new RewardController()

router.get("/reward/:id", authenticateJwt, rewardController.getRewardById)
router.get("/rewards/node/:nodeId", authenticateJwt, rewardController.getRewardsByNodeId)
router.get("/rewards/user", authenticateJwt, rewardController.getUserRewards)
router.get("/rewards/user/total", authenticateJwt, rewardController.getUserTotalReward)
router.post("/reward/claim", authenticateJwt, rewardController.claimUserReward)

export { router as reward }
