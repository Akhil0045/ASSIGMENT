const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

const setBudget = async (req, res, next) => {
  try {
    const { category, limit } = req.body;
    const userId = req.user._id;
    
    // upsert the budget
    const budget = await Budget.findOneAndUpdate(
      { userId, category: category.toLowerCase() },
      { limit },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    res.status(200).json(budget);
  } catch (error) {
    next(error);
  }
};

const getBudgetStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Fetch all budgets for the user
    const budgets = await Budget.find({ userId });
    
    if (budgets.length === 0) {
      return res.status(200).json([]);
    }

    // 2. Fetch expenses aggregated by category for this user
    const expensesAgg = await Transaction.aggregate([
      { $match: { userId, type: 'expense', isDeleted: false } },
      {
        $group: {
          _id: { $toLower: '$category' },
          spent: { $sum: '$amount' }
        }
      }
    ]);

    // Fast lookup for spent amounts
    const spentMap = {};
    expensesAgg.forEach(expense => {
      spentMap[expense._id] = expense.spent;
    });

    // 3. Map budget limits to spent values
    const status = budgets.map(b => {
      const spent = spentMap[b.category] || 0;
      return {
        id: b._id,
        category: b.category,
        limit: b.limit,
        spent: spent,
        remaining: b.limit - spent
      };
    });

    res.status(200).json(status);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setBudget,
  getBudgetStatus
};
