import { Router } from "express";
import { authenticateJwt } from "@/middleware";
import UserController from "@/controller/user/user.controller";
import WalletController from "@/controller/user/wallet.controller";

const router = Router();
const userController: UserController = new UserController();
const walletController: WalletController = new WalletController();

// router.post("/register", userController.register);

// router.post("/login", userController.login);

router.post('/connect-wallet', userController.connectWallet)

router.post('/check-user', userController.checkUser)

router.post('/update/username', authenticateJwt, userController.updateUsername)

router.post('/update/ssh-public-key', authenticateJwt, userController.updateTheSSHPublicKey)


router.post('/get/authenticated-user', authenticateJwt, userController.getAuthenticatedUser)


router.post('/generate/session-id', userController.generateSessionId)
router.post('/check/session-id/:sessionId', userController.checkSessionId)
router.post('/verify/session-id', authenticateJwt, userController.verifyUserSession)


router.post('/deposit', authenticateJwt, walletController.deposit)


export { router as user };
