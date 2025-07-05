const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetStatus
} = require('../controllers/budgetController');

// Apply authentication middleware to all routes
router.use(authenticateUser);

router.get('/', getBudgets);
router.get('/status', getBudgetStatus);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;