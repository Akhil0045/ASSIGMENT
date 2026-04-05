const { prisma } = require('../config/db');
const { resolveScope } = require('../utils/scopeUtils');

// ─── ANALYTICS: Summary ──────────────────────────────────────────
// Supports ?userId / ?email to narrow the summary to one user
const getBalanceSummary = async (callerUserId, callerRole, query = {}) => {
  const scope = await resolveScope(callerUserId, callerRole, query);
  const where = { ...scope, isDeleted: false };

  const summary = await prisma.transaction.groupBy({
    by: ['type'],
    where,
    _sum: { amount: true },
  });

  let income = 0, expenses = 0;
  summary.forEach(item => {
    if (item.type === 'income')  income   = item._sum.amount || 0;
    if (item.type === 'expense') expenses = item._sum.amount || 0;
  });

  return {
    income,
    expenses,
    balance: income - expenses,
    scope: scope.userId
      ? { filtered: true, userId: scope.userId }
      : { filtered: false, description: 'All users aggregated' },
  };
};

// ─── ANALYTICS: Charts ───────────────────────────────────────────
// Supports ?userId / ?email to narrow charts to one user
const getChartData = async (callerUserId, callerRole, query = {}) => {
  const { startDate, endDate } = query;

  const scope = await resolveScope(callerUserId, callerRole, query);
  const baseWhere = { ...scope, isDeleted: false };

  if (startDate || endDate) {
    baseWhere.date = {};
    if (startDate) baseWhere.date.gte = new Date(startDate + 'T00:00:00.000Z');
    if (endDate)   baseWhere.date.lte = new Date(endDate   + 'T23:59:59.999Z');
  }

  const expensesByCategoryRaw = await prisma.transaction.groupBy({
    by: ['category'],
    where: { ...baseWhere, type: 'expense' },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  const expensesByCategory = expensesByCategoryRaw.map(item => ({
    name:  item.category,
    value: item._sum.amount || 0,
  }));

  const allTransactions = await prisma.transaction.findMany({
    where: baseWhere,
    select: { date: true, type: true, amount: true },
    orderBy: { date: 'asc' },
  });

  const trendsMap = {};
  allTransactions.forEach(tx => {
    const dateStr = tx.date.toISOString().split('T')[0];
    if (!trendsMap[dateStr]) trendsMap[dateStr] = { date: dateStr, income: 0, expense: 0 };
    if (tx.type === 'income')  trendsMap[dateStr].income  += tx.amount;
    if (tx.type === 'expense') trendsMap[dateStr].expense += tx.amount;
  });

  return {
    expensesByCategory,
    trends: Object.values(trendsMap),
    scope: scope.userId
      ? { filtered: true, userId: scope.userId }
      : { filtered: false, description: 'All users aggregated' },
  };
};

module.exports = {
  getBalanceSummary,
  getChartData,
};
