import { fetchMyTransactions } from "@/services/prisma/transaction";
import { NextFunction, Request, Response } from "express";


class TransactionController {

    public async getMyTransactions(req: Request, res: Response, next: NextFunction) {
        try {

            const txs = await fetchMyTransactions(req.user.id)

            res.status(200).send(txs)
        } catch (err) {
            next(err)
        }
    }


}
export default TransactionController;