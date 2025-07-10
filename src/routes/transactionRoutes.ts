import { Router } from 'express';
import {
  getTransactions,
  getIncomeTransactions,
  getExpensesTransactions,
} from '@controllers/transactionController';

const router = Router();

router.get('/:userId', getTransactions);
router.get('/income/:userId', getIncomeTransactions);
router.get('/expense/:userId', getExpensesTransactions);

export default router;
