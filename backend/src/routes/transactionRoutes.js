const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getCharts
} = require('../controllers/transactionController');
const { protect } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { createTransactionSchema, updateTransactionSchema } = require('../validators/transactionValidator');

router.use(protect);

router.route('/')
  .post(validate(createTransactionSchema), createTransaction)
  .get(getTransactions);

router.get('/summary', getSummary);
router.get('/charts', getCharts);


router.route('/:id')
  .put(validate(updateTransactionSchema), updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
