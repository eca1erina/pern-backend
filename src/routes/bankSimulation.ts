import express from 'express';
import { fetchBankTransactions } from '../controllers/bankSimulationController';

const router = express.Router();

router.get('/mockbank', fetchBankTransactions);

export default router;
