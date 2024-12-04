import { verifyPayment } from "@/services/ethers/payment";
import { updatePricePair } from "@/services/prisma/price-pair/main";
import { fetchTransactionsByHash, saveTransaction } from "@/services/prisma/transaction";
import { updateBalance } from "@/services/prisma/user";
import { NextFunction, Request, Response } from "express";


class WalletController {

    public async deposit(req: Request, res: Response, next: NextFunction) {
        try {
            const { txHash } = req.body;

            const verifiedPayment = await verifyPayment(txHash);

            //checking if its sent by the acutal owner
            if (req.user.publicAddress !== verifiedPayment.from) {
                throw new Error("Invalid owner")
            }
            //check if its already exist
            const txUsed = await fetchTransactionsByHash(txHash);
            if (txUsed) {
                throw new Error("Transaction used already");
            }

            await saveTransaction({
                txHash,
                from: verifiedPayment.from,
                to: verifiedPayment.to,
                value: verifiedPayment.value,
                type: "deposit",
                status: "success",
            }, req.user.id);

            const ethRate = await updatePricePair()

            const valueInUSD = parseFloat(verifiedPayment.value) * ethRate.price

            const updatedUser = await updateBalance(req.user.id, "ADD", valueInUSD)

            res.status(200).send({ balance: updatedUser.balance })


        } catch (err) {
            next(err)
        }
    }

    public async withdraw(req: Request, res: Response, next: NextFunction) {
        try {
            const { amount } = req.body;


            // const verifiedPayment = await verifyPayment();

            // await saveTransaction({
            //     txHash,
            //     from: verifiedPayment.from,
            //     to: verifiedPayment.to,
            //     value: verifiedPayment.value,
            //     type: "deposit",
            //     status: "success",
            // }, req.user.id);


        } catch (err) {
            next(err)
        }
    }


}
export default WalletController;