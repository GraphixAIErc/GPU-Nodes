// import { getImages, saveImage } from '@/services/prisma/image';
// import { generateImage } from '@/services/openai';
import { NextFunction, Request, Response } from 'express';
import { generateAwsPresignedUrl } from '@/services/aws/generate';
import { createAwsInstance, fetchAllAwsInstances, fetchInstanceStatus } from '@/services/aws/intances';
import { fetchAllInstanceTypes, fetchInstanceByType, fetchKeyPair, fetchMyInstances, saveInstance, saveKeyPair, testEditFiles } from '@/services/prisma/instance';
import { verifyPayment } from '@/services/ethers/payment';
import { fetchTransactionsByHash, saveTransaction } from '@/services/prisma/transaction';
import { weiToEth } from '@/utils/ethers';
import { updateBalance } from '@/services/prisma/user';


class AWSController {
    public async generatePresignedUrl(req: Request, res: Response, next: NextFunction) {

        try {
            const { fileName, fileType } = req.body;

            if (!fileName || !fileType) {
                throw new Error("fileName and fileType are required")
            }

            const presignedUrl = await generateAwsPresignedUrl(fileName, fileType)

            return res.status(200).json(presignedUrl);
        } catch (error) {
            next(error);
            return
        }
    }

    public async getAllAvailableInstances(req: Request, res: Response, next: NextFunction) {

        try {
            const instances = await fetchAllAwsInstances();
            return res.status(200).json(instances);
        } catch (error) {
            next(error);
            return
        }
    }

    public async fetchAllInstanceTypes(req: Request, res: Response, next: NextFunction) {

        try {
            const instances = await fetchAllInstanceTypes();
            return res.status(200).json(instances);
        } catch (error) {
            next(error);
            return
        }
    }


    public async createInstance(req: Request, res: Response, next: NextFunction) {

        try {
            const { instanceType, duration, txHash } = req.body;

            if (!instanceType || !duration || !txHash || duration < 6) {
                throw new Error("Invalid instance type or duration");
            }

            const txUsed = await fetchTransactionsByHash(txHash);
            if (txUsed) {
                throw new Error("Transaction used already");
            }

            const instances = await fetchInstanceByType(instanceType);
            if (!instances) {
                throw new Error("Instance type not found");
            }

            const instancePrice = instances.price * duration;
            if (req.user.balance < instancePrice) {
                throw new Error("Insufficient balance");
            }

            // Deduct balance first to reserve funds
            await updateBalance(req.user.id, "MINUS", instancePrice);

            // Attempt to create AWS instance
            const { instance, keyPair } = await createAwsInstance(req.user.id, instances.type);
            if (!instance || !instance.Instances || !instance.Instances[0]) {
                throw new Error("Instance creation failed");
            }

            const expireAt = new Date();
            expireAt.setHours(expireAt.getHours() + duration);
            const savedInstance = await saveInstance(req.user.id, {
                instanceId: instance.Instances[0].InstanceId,
                instanceTypeId: instances.id,
                keyName: keyPair.KeyName,
                expireAt: expireAt,
                PublicIpAddress: ""
            });

            const savedKeyPair = await saveKeyPair(req.user.id, savedInstance.instanceId, keyPair);
            await saveTransaction({
                txHash,
                from: req.user.publicAddress,
                to: instanceType,
                value: instancePrice,
                type: "payment",
                status: "success",
            }, req.user.id);

            return res.status(200).json({ keyPair: savedKeyPair, instance: savedInstance });
        } catch (error) {
            next(error);
            return
        }
    }



    public async getInstanceStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const instance = await fetchInstanceStatus(req.params.instanceId)
            return res.status(200).json(instance);
        } catch (error) {
            next(error);
            return
        }
    }

    public async getMyInstances(req: Request, res: Response, next: NextFunction) {
        try {
            const instance = await fetchMyInstances(req.user.id)
            return res.status(200).json(instance);
        } catch (error) {
            next(error);
            return
        }
    }

    public async getMyKeyPair(req: Request, res: Response, next: NextFunction) {
        try {
            const instance = await fetchKeyPair(req.user.id, req.params.keyName)
            return res.status(200).json(instance);
        } catch (error) {
            next(error);
            return
        }
    }


    public async test(req: Request, res: Response, next: NextFunction) {
        try {
            const instance = testEditFiles()
            return res.status(200).json(instance);
        } catch (error) {
            next(error);
            return
        }
    }
}





export default AWSController;