import { verifyMessage } from "@/services/ethers";
import { generateAuthToken } from "@/services/jwt";
import { createUser, getUser, updateNonce, updateSSHPublicKey, updateUsername } from "@/services/prisma/user";
import { generateSessionId } from "@/utils";
import { NextFunction, Request, Response } from "express";

const sessions: any = {};

class UserController {

    public async connectWallet(req: Request, res: Response, next: NextFunction) {
        try {
            const { signature, publicAddress } = req.body;
            if (!signature || signature === "" || !publicAddress || publicAddress === "") throw new Error("invalid body")
            const user = await getUser(publicAddress)
            if (!user) throw new Error("user not found")
            const pk = verifyMessage(user.nonce, signature)
            if (pk !== publicAddress) throw new Error("invalid signature")
            await updateNonce(publicAddress)
            const token = await generateAuthToken(user.id, publicAddress)
            res.status(200).send({ token })
        } catch (err) {
            next(err)
        }
    }
    public async checkUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { publicAddress } = req.body;
            if (!publicAddress || publicAddress === "") throw new Error("invalid body")
            const data = await createUser(publicAddress)
            res.status(200).send(data)
        } catch (err) {
            next(err)
        }
    }
    public async updateUsername(req: Request, res: Response, next: NextFunction) {
        try {
            const { username } = req.body;
            if (!username || username === "") throw new Error("invalid body")
            const data = await updateUsername(req.user.id, username)
            res.status(200).send(data)
        } catch (err) {
            next(err)
        }
    }

    public async getAuthenticatedUser(req: Request, res: Response, next: NextFunction) {
        try {
            res.status(200).send({ user: req.user })
        } catch (err) {
            next(err)
        }
    }


    public async generateSessionId(req: Request, res: Response, next: NextFunction) {
        try {

            const { deviceId } = req.body;
            const sessionId = generateSessionId();
            sessions[sessionId] = { deviceId, status: 'pending' };
            res.status(200).send({ sessionId })
        } catch (err) {
            next(err)
        }
    }

    public async checkSessionId(req: Request, res: Response, next: NextFunction) {
        try {
            const { sessionId } = req.params;
            if (sessions[sessionId] && sessions[sessionId].cliToken) {
                res.json({
                    token: sessions[sessionId].cliToken,
                    publicAddress: sessions[sessionId].publicAddress
                });
                delete sessions[sessionId];
            } else {
                res.status(404).json({ error: 'Token not ready or session invalid' });
            }

        } catch (err) {
            next(err)
        }
    }
    public async verifyUserSession(req: Request, res: Response, next: NextFunction) {
        try {
            const { sessionId } = req.body;
            if (!sessions[sessionId]) throw new Error("Session not found")

            const cliToken = generateAuthToken(req.user.id, req.user.publicAddress)
            sessions[sessionId].cliToken = cliToken;
            sessions[sessionId].publicAddress = req.user.publicAddress;
            sessions[sessionId].status = "success";

            res.status(200).send({ success: true })
        } catch (err) {
            console.log(err)
            next(err)
        }
    }

    public async updateTheSSHPublicKey(req: Request, res: Response, next: NextFunction) {
        try {
            const { sshPublicKey } = req.body;
            if (!sshPublicKey) throw new Error("invalid body")
            const updatedUser = await updateSSHPublicKey(req.user.id, sshPublicKey)
            res.status(200).send({status: "success"})

        } catch (err) {
            next(err)
        }
    }


    // public async register(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         res.status(200).send({ user: null });
    //     } catch (err: any) {
    //         next(err);
    //     }
    // }

    // public async login(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         res.status(200).send({ user: null });
    //     } catch (err: any) {
    //         next(err);
    //     }
    // }

}
export default UserController;