const express = require('express');
const router = express.Router();
const { setBudget, getBudgetStatus } = require('../controllers/budgetController');
const { protect } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { budgetSchema } = require('../validators/budgetValidator');

router.use(protect);

router.post('/', validate(budgetSchema), setBudget);
router.get('/status', getBudgetStatus);

module.exports = router;
