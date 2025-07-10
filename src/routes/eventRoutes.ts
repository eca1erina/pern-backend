import { Router } from 'express';
import {
  getUsers,
  signupUser,
  loginUser,
  getCurrentUser,
  addTransaction,
  getUserTransactions,
} from '@controllers/eventController';

const router = Router();

router.get('/', getUsers);
router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/:id', getCurrentUser);
router.post('/transactions', addTransaction);
router.get('/:userId/transactions', getUserTransactions);

export default router;
