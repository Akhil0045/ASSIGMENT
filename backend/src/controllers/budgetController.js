const { prisma } = require('../config/db');
const { resolveScope } = require('../utils/scopeUtils');

const setBudget = async (req, res, next) => {
  try {
    const { category, limit, targetUserEmail } = req.body;
    let userId = req.user.id;
    const normalizedCategory = category.toLowerCase();

    if (req.user.role === 'admin') {
      if (!targetUserEmail) {
        throw Object.assign(new Error('Admin must specify a target user email when logging an entry.'), { status: 400 });
      }
      const targetUser = await prisma.user.findUnique({ where: { email: targetUserEmail } });
      if (!targetUser) throw Object.assign(new Error('Target user not found'), { status: 404 });
      userId = targetUser.id;
    }
    
    // Prisma upsert for Budget (unique constraint on userId and category)
    const budget = await prisma.budget.upsert({
      where: {
        userId_category: {
          userId,
          category: normalizedCategory,
        },
      },
      update: {
        limit: Number(limit),
      },
      create: {
        userId,
        category: normalizedCategory,
        limit: Number(limit),
      },
    });
    
    res.status(200).json(budget);
  } catch (error) {
    next(error);
  }
};

const getBudgetStatus = async (req, res, next) => {
  try {
    const scope = await resolveScope(req.user.id, req.user.role, req.query);
    
    // Budgets are strictly per-user. An aggregate budget across all users is invalid.
    if (!scope.userId) {
      return res.status(200).json([]);
    }

    const userId = scope.userId;

    // 1. Fetch all budgets for the user
    const budgets = await prisma.budget.findMany({
      where: { userId },
    });
    
    if (budgets.length === 0) {
      return res.status(200).json([]);
    }

    // 2. Fetch expenses aggregated by category for this user using Prisma's groupBy
    const expensesAgg = await prisma.transaction.groupBy({
      by: ['category'],
      where: { 
        userId, 
        type: 'expense', 
        isDeleted: false 
      },
      _sum: {
        amount: true,
      },
    });

    // Fast lookup for spent amounts
    const spentMap = {};
    expensesAgg.forEach(expense => {
      // Assuming categories are normalized to lowercase in DB
      spentMap[expense.category.toLowerCase()] = expense._sum.amount || 0;
    });

    // 3. Map budget limits to spent values
    const status = budgets.map(b => {
      const spent = spentMap[b.category.toLowerCase()] || 0;
      return {
        id: b.id,
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
