const { prisma } = require('../config/db');

// GET /api/admin/users - List all users
const listUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, isActive } = req.query;

    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { transactions: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.user.count({ where });

    res.json({
      users,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/users/:id/role - Update user role
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ['viewer', 'analyst', 'admin'];
    if (!allowedRoles.includes(role)) {
      res.status(400);
      return next(new Error(`Invalid role. Must be one of: ${allowedRoles.join(', ')}`));
    }

    // Prevent admin from downgrading themselves
    if (id === req.user.id && role !== 'admin') {
      res.status(400);
      return next(new Error('You cannot change your own admin role'));
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/users/:id/status - Activate or deactivate a user
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      res.status(400);
      return next(new Error('isActive must be a boolean'));
    }

    // Prevent admin from deactivating themselves
    if (id === req.user.id && !isActive) {
      res.status(400);
      return next(new Error('You cannot deactivate your own account'));
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/users/:id - Delete a user
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      res.status(400);
      return next(new Error('You cannot delete your own account'));
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    // Soft approach: deactivate instead of hard delete to preserve transaction history
    await prisma.user.update({ where: { id }, data: { isActive: false } });

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/stats - System-wide summary
const systemStats = async (req, res, next) => {
  try {
    const [userCount, transactionCount, summary] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count({ where: { isDeleted: false } }),
      prisma.transaction.groupBy({
        by: ['type'],
        where: { isDeleted: false },
        _sum: { amount: true },
      }),
    ]);

    let totalIncome = 0, totalExpenses = 0;
    summary.forEach(s => {
      if (s.type === 'income') totalIncome = s._sum.amount || 0;
      if (s.type === 'expense') totalExpenses = s._sum.amount || 0;
    });

    res.json({
      totalUsers: userCount,
      totalTransactions: transactionCount,
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { listUsers, updateUserRole, updateUserStatus, deleteUser, systemStats };
