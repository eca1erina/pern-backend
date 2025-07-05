const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  addToSavingsGoal
} = require('../controllers/savingsGoalController');

// Apply authentication middleware to all routes
router.use(authenticateUser);

router.get('/', getSavingsGoals);
router.post('/', createSavingsGoal);
router.put('/:id', updateSavingsGoal);
router.delete('/:id', deleteSavingsGoal);
router.post('/:id/add', addToSavingsGoal);

module.exports = router;