const { prisma } = require('../config/db');
const { resolveScope } = require('../utils/scopeUtils');

/**
 * RBAC Data Visibility Rules:
 *
 *  Viewer    → always sees ONLY own records. filterUser params ignored.
 *  Analyst   → sees ALL records by default. Can filter by ?userId or ?email.
 *              Cannot modify anything.
 *  Admin     → sees ALL records by default. Can filter by ?userId or ?email.
 *              Full write access (create/update/delete).
 */

// ─── CREATE (Viewer & Admin) ──────────────────────────────────────────────────────
const addTransaction = async (callerUserId, callerRole, data) => {
  let targetUserId = callerUserId;
  const { targetUserEmail, ...restData } = data;

  if (callerRole === 'admin') {
    if (!targetUserEmail) {
      throw Object.assign(new Error('Admin must specify a target user email when logging an entry.'), { status: 400 });
    }
    const targetUser = await prisma.user.findUnique({ where: { email: targetUserEmail } });
    if (!targetUser) throw Object.assign(new Error('Target user not found'), { status: 404 });
    targetUserId = targetUser.id;
  }

  return await prisma.transaction.create({
    data: {
      ...restData,
      userId: targetUserId,
      date: restData.date ? new Date(restData.date) : new Date(),
    },
  });
};

// ─── READ: All roles — scope enforced by resolveScope() ──────────────────────
const getTransactions = async (callerUserId, callerRole, query) => {
  const { page = 1, limit = 10, type, category, startDate, endDate, search } = query;

  const scope = await resolveScope(callerUserId, callerRole, query);

  const where = { ...scope, isDeleted: false };

  if (type) where.type = type;

  if (search) {
    where.OR = [
      { category:    { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  } else if (category) {
    where.category = { contains: category, mode: 'insensitive' };
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate)   where.date.lte = new Date(endDate);
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        user: { select: { email: true } }
      }
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    total,
    page:  Number(page),
    pages: Math.ceil(total / Number(limit)),
    // Inform caller what scope was applied
    scope: scope.userId
      ? { filtered: true, userId: scope.userId }
      : { filtered: false, description: 'All users aggregated' },
  };
};

// ─── UPDATE (All roles, restricted to own unless Admin) ──────────────────────────────────────────────────────
const updateTransaction = async (id, data, callerUserId, callerRole) => {
  const transaction = await prisma.transaction.findFirst({ where: { id, isDeleted: false } });
  if (!transaction) throw Object.assign(new Error('Transaction not found'), { status: 404 });

  if (callerRole !== 'admin' && transaction.userId !== callerUserId) {
    throw Object.assign(new Error('Unauthorized: You can only modify your own transactions'), { status: 403 });
  }

  return await prisma.transaction.update({
    where: { id },
    data: { ...data, date: data.date ? new Date(data.date) : undefined },
  });
};

// ─── SOFT DELETE (All roles, restricted to own unless Admin) ─────────────────────────────────────────────────
const softDeleteTransaction = async (id, callerUserId, callerRole) => {
  const transaction = await prisma.transaction.findFirst({ where: { id, isDeleted: false } });
  if (!transaction) throw Object.assign(new Error('Transaction not found'), { status: 404 });

  if (callerRole !== 'admin' && transaction.userId !== callerUserId) {
    throw Object.assign(new Error('Unauthorized: You can only delete your own transactions'), { status: 403 });
  }

  return await prisma.transaction.update({ where: { id }, data: { isDeleted: true } });
};

module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
  softDeleteTransaction,
};
