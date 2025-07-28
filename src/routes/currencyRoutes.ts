import express from 'express';
import { getExchangeRate } from '../controllers/currencyController';

const router = express.Router();

router.get('/exchange-rate', getExchangeRate);

export default router;
