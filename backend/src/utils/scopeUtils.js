const { prisma } = require('../config/db');

// ─── HELPER: resolve target userId from query params ─────────────────────────
// For analyst/admin: optional ?userId or ?email param narrows scope to one user
// For viewer: always locked to their own userId
const resolveScope = async (callerUserId, callerRole, query) => {
  if (callerRole === 'viewer') {
    return { userId: callerUserId };   // always own data only
  }

  // analyst / admin — optional single-user filter
  const { userId, email } = query;

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw Object.assign(new Error(`No user found with id: ${userId}`), { status: 404 });
    return { userId };
  }

  if (email) {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) throw Object.assign(new Error(`No user found with email: ${email}`), { status: 404 });
    return { userId: user.id };
  }

  return {};   // no filter → all users' data
};

module.exports = {
  resolveScope,
};
