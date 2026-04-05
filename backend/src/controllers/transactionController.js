const transactionService = require('../services/transactionService');

// ─── Admin only ───────────────────────────────────────────────────────────────
const createTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.addTransaction(req.user.id, req.user.role, req.body);
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

// ─── All roles (data scope enforced in service) ───────────────────────────────
// ?userId or ?email narrows results for analyst/admin to one user
const getTransactions = async (req, res, next) => {
  try {
    const result = await transactionService.getTransactions(
      req.user.id,
      req.user.role,
      req.query,
    );
    res.json(result);
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  }
};

// ─── All roles (restricted by service) ─────────────────────────────────────────
const updateTransaction = async (req, res, next) => {
  try {
    const updated = await transactionService.updateTransaction(
      req.params.id, 
      req.body, 
      req.user.id, 
      req.user.role
    );
    res.json(updated);
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  }
};

// ─── All roles (restricted by service) ─────────────────────────────────────────
const deleteTransaction = async (req, res, next) => {
  try {
    await transactionService.softDeleteTransaction(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.json({ message: 'Record deleted' });
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
