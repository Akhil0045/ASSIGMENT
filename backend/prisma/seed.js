require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function hashPwd(pwd) {
  return bcrypt.hash(pwd, 10);
}

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── 1. Create role-based users ───────────────────────────────────────────
  const users = [
    { email: 'admin@finance.com',   name: 'Admin User',    password: 'Admin@123',   role: 'admin'   },
    { email: 'analyst@finance.com', name: 'Analyst User',  password: 'Analyst@123', role: 'analyst' },
    { email: 'viewer@finance.com',  name: 'Viewer User',   password: 'Viewer@123',  role: 'viewer'  },
  ];

  const createdUsers = {};
  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      createdUsers[u.role] = existing;
      console.log(`  ⏩ User already exists: ${u.email} (${u.role})`);
    } else {
      const user = await prisma.user.create({
        data: { ...u, password: await hashPwd(u.password) },
      });
      createdUsers[u.role] = user;
      console.log(`  ✅ Created user: ${u.email} (${u.role})`);
    }
  }

  // ─── 2. Seed transactions for the analyst user ─────────────────────────────
  const analystId = createdUsers.analyst.id;
  await prisma.transaction.deleteMany({ where: { userId: analystId } });

  const now = new Date();
  const txns = [
    { amount: 75000, type: 'income',  category: 'Salary',        description: 'Monthly salary',         date: new Date(now.getFullYear(), now.getMonth(), 1) },
    { amount: 18000, type: 'income',  category: 'Freelance',     description: 'Product design contract', date: new Date(now.getFullYear(), now.getMonth(), 5) },
    { amount: 3500,  type: 'income',  category: 'Investments',   description: 'Stock dividends',         date: new Date(now.getFullYear(), now.getMonth(), 10) },
    { amount: 15000, type: 'expense', category: 'Rent',          description: 'Monthly apartment rent',  date: new Date(now.getFullYear(), now.getMonth(), 1) },
    { amount: 4200,  type: 'expense', category: 'Food',          description: 'Grocery & supermarket',   date: new Date(now.getFullYear(), now.getMonth(), 3) },
    { amount: 1100,  type: 'expense', category: 'Food',          description: 'Restaurant outings',      date: new Date(now.getFullYear(), now.getMonth(), 8) },
    { amount: 1800,  type: 'expense', category: 'Travel',        description: 'Cab & metro rides',       date: new Date(now.getFullYear(), now.getMonth(), 6) },
    { amount: 3200,  type: 'expense', category: 'Utilities',     description: 'Electricity, internet',   date: new Date(now.getFullYear(), now.getMonth(), 7) },
    { amount: 6000,  type: 'expense', category: 'Shopping',      description: 'Clothing & accessories',  date: new Date(now.getFullYear(), now.getMonth(), 12) },
    { amount: 1200,  type: 'expense', category: 'Entertainment', description: 'Streaming & events',      date: new Date(now.getFullYear(), now.getMonth(), 2) },
    { amount: 800,   type: 'expense', category: 'Health',        description: 'Gym & pharmacy',          date: new Date(now.getFullYear(), now.getMonth(), 4) },
    { amount: 2000,  type: 'expense', category: 'Education',     description: 'Online course fee',       date: new Date(now.getFullYear(), now.getMonth(), 9) },
  ];

  for (const tx of txns) {
    await prisma.transaction.create({ data: { ...tx, userId: analystId } });
  }
  console.log(`\n  ✅ Created ${txns.length} transactions for analyst@finance.com`);

  // ─── 3. Seed budgets for the analyst user ───────────────────────────────────
  const budgets = [
    { category: 'food',          limit: 6000 },
    { category: 'travel',        limit: 2500 },
    { category: 'shopping',      limit: 7000 },
    { category: 'entertainment', limit: 2000 },
    { category: 'health',        limit: 1500 },
    { category: 'utilities',     limit: 4000 },
  ];

  for (const b of budgets) {
    await prisma.budget.upsert({
      where: { userId_category: { userId: analystId, category: b.category } },
      update: { limit: b.limit },
      create: { userId: analystId, ...b },
    });
  }
  console.log(`  ✅ Created ${budgets.length} budget entries for analyst@finance.com`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Seeding complete!\n');
  console.log('Test accounts:');
  console.log('  👑 Admin   → admin@finance.com    | Admin@123');
  console.log('  🔬 Analyst → analyst@finance.com  | Analyst@123');
  console.log('  👁️  Viewer  → viewer@finance.com   | Viewer@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
