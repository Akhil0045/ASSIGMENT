const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');
const { validate } = require('../middlewares/validate');
const { createTransactionSchema, updateTransactionSchema } = require('../validators/transactionValidator');

// All routes require authentication
router.use(protect);

// ─── READ: All roles can access their own records ─────────────────────────────
// Viewer → own data only | Analyst/Admin → all users' data (enforced in service)
router.get('/', getTransactions);

// ─── WRITE: Admin and Viewer only (Analyst is read-only) ────────────────────
router.post('/',   authorize('admin', 'viewer'), validate(createTransactionSchema), createTransaction);
router.put('/:id', authorize('admin', 'viewer'), validate(updateTransactionSchema), updateTransaction);
router.delete('/:id', authorize('admin', 'viewer'), deleteTransaction);

module.exports = router;
