import { getAllAiModels } from '@/services/prisma/aimodel';
import { NextFunction, Request, Response } from 'express';


class MlController {
    public async getAiModels(req: Request, res: Response, next: NextFunction) {

        try {
            const aiModels = await getAllAiModels();

            return res.status(200).json(aiModels);
        } catch (error) {
            next(error);
            return
        }
    }

}

export default MlController;