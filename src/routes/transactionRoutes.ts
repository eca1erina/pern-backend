import express from 'express';
import {
  getTransactions,
  getIncomeTransactions,
  getExpensesTransactions,
  addTransaction,
  deleteTransaction,
} from '../controllers/transactionController';

import {
  getExpenseCategories
} from '../controllers/categoriesController'

const router = express.Router();

router.get('/', getTransactions);
router.get('/income', getIncomeTransactions);
router.get('/expenses', getExpensesTransactions);
router.post('/', addTransaction);
router.delete('/:id', deleteTransaction);
router.get('/categories/expense', getExpenseCategories);

export default router;
