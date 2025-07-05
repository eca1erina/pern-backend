const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary
} = require('../controllers/transactionController');

// Apply authentication middleware to all routes
router.use(authenticateUser);

router.get('/', getTransactions);
router.get('/summary', getTransactionSummary);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;