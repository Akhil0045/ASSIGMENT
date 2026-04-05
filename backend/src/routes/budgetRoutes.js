const express = require('express');
const router = express.Router();
const { setBudget, getBudgetStatus } = require('../controllers/budgetController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');
const { validate } = require('../middlewares/validate');
const { budgetSchema } = require('../validators/budgetValidator');

router.use(protect);

// All roles can view budget status
router.get('/status', getBudgetStatus);

// Only Admin and Viewer can create or update budget limits
router.post('/', authorize('admin', 'viewer'), validate(budgetSchema), setBudget);

module.exports = router;
