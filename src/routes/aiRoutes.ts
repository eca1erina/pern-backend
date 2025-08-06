import express from 'express';
import { analyzeUserTransactions } from 'controllers/AIController';

const router = express.Router();

router.get('/', analyzeUserTransactions);

export default router;