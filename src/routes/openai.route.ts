import OpenAIController from '@/controller/ai/openai.controller';
import { authenticateJwt } from '@/middleware';
import { memoryStorage, multerUpload } from '@/services/multer';
import { Router } from 'express';

const router = Router();
const openAiController: OpenAIController = new OpenAIController();

router.post('/generate/text-to-image', authenticateJwt, openAiController.generateTextToImage);
// router.post('/edit/text-to-image', authenticateJwt, multerUpload.fields([{ name: 'image', maxCount: 1 }, { name: 'mask', maxCount: 1 }]), openAiController.editTextToImage);
router.post('/generate/variation', authenticateJwt, multerUpload.single("image"), openAiController.generateVariation);
router.get('/generated/images', openAiController.getAllImages);




export { router as openai };
