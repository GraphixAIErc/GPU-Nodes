import { getImages, saveImage } from '@/services/prisma/image';
import { generateImage, openaiCreateVariation } from '@/services/openai';
import { NextFunction, Request, Response } from 'express';
import { uploadImageFromUrl } from '@/services/aws/upload';
import { updatePricePair } from '@/services/prisma/price-pair/main';


class CryptoDataController {
    public async fetchRates(req: Request, res: Response, next: NextFunction) {

        try {

            const response = await updatePricePair()

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }


}

export default CryptoDataController;