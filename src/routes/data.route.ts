import { Router } from 'express';
import CryptoDataController from '@/controller/data/crypto.controller';

const router = Router();
const cryptoDataController: CryptoDataController = new CryptoDataController();

router.get('/crypto-pairs', cryptoDataController.fetchRates);



export { router as data };
