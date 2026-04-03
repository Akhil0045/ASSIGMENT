const Transaction = require('../models/Transaction');

const addTransaction = async (userId, data) => {
  return await Transaction.create({ ...data, userId });
};

const getTransactions = async (userId, query) => {
  const { page = 1, limit = 10, type, category, startDate, endDate } = query;
  
  const filter = { userId, isDeleted: false };
  
  if (type) filter.type = type;
  if (category) filter.category = { $regex: category, $options: 'i' };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const transactions = await Transaction.find(filter)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Transaction.countDocuments(filter);

  return { transactions, total, page: Number(page), pages: Math.ceil(total / limit) };
};

const updateTransaction = async (userId, id, data) => {
  const transaction = await Transaction.findOne({ _id: id, userId, isDeleted: false });
  if (!transaction) throw new Error('Transaction not found');

  return await Transaction.findByIdAndUpdate(id, data, { new: true });
};

const softDeleteTransaction = async (userId, id) => {
  const transaction = await Transaction.findOne({ _id: id, userId, isDeleted: false });
  if (!transaction) throw new Error('Transaction not found');

  transaction.isDeleted = true;
  return await transaction.save();
};

const getBalanceSummary = async (userId) => {
  const summary = await Transaction.aggregate([
    { $match: { userId, isDeleted: false } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' }
      }
    }
  ]);

  let income = 0;
  let expenses = 0;

  summary.forEach(item => {
    if (item._id === 'income') income = item.total;
    if (item._id === 'expense') expenses = item.total;
  });

  return {
    income,
    expenses,
    balance: income - expenses
  };
};

const getChartData = async (userId, query = {}) => {
  const { startDate, endDate } = query;
  const matchFilter = { userId, isDeleted: false };
  const expenseMatchFilter = { userId, type: 'expense', isDeleted: false };
  
  if (startDate || endDate) {
    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate + 'T00:00:00.000Z');
    if (endDate) dateQuery.$lte = new Date(endDate + 'T23:59:59.999Z');
    matchFilter.date = dateQuery;
    expenseMatchFilter.date = dateQuery;
  }

  const expensesByCategory = await Transaction.aggregate([
    { $match: expenseMatchFilter },
    {
      $group: {
        _id: '$category',
        value: { $sum: '$amount' }
      }
    },
    { $sort: { value: -1 } }
  ]);

  const trends = await Transaction.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        income: {
          $sum: {
            $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
          }
        },
        expense: {
          $sum: {
            $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    expensesByCategory: expensesByCategory.map(item => ({ name: item._id, value: item.value })),
    trends: trends.map(item => ({ date: item._id, income: item.income, expense: item.expense }))
  };
};

module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
  softDeleteTransaction,
  getBalanceSummary,
  getChartData
};
