const transactionService = require('../services/transactionService');

const createTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.addTransaction(req.user._id, req.body);
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const result = await transactionService.getTransactions(req.user._id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const updated = await transactionService.updateTransaction(req.user._id, req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    if (error.message === 'Transaction not found') res.status(404);
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    await transactionService.softDeleteTransaction(req.user._id, req.params.id);
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    if (error.message === 'Transaction not found') res.status(404);
    next(error);
  }
};

const getSummary = async (req, res, next) => {
  try {
    const summary = await transactionService.getBalanceSummary(req.user._id);
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

const getCharts = async (req, res, next) => {
  try {
    const charts = await transactionService.getChartData(req.user._id, req.query);
    res.json(charts);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getCharts
};
