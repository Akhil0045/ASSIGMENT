/**
 * COMPREHENSIVE SEED SCRIPT
 * ─────────────────────────
 * Creates 10 users with mixed roles + realistic financial data:
 *   - 1 Admin, 3 Analysts, 6 Viewers
 *   - 50–120 random transactions per user across last 6 months
 *   - Budgets set for each user
 *   - Covers all categories, both income & expense types
 *
 * Run: node prisma/seed_full.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg }    = require('@prisma/adapter-pg');
const { Pool }        = require('pg');
const bcrypt          = require('bcrypt');

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const USERS = [
  { name: 'Alice Admin',    email: 'alice@finapp.com',   password: 'Admin@123',    role: 'admin'   },
  { name: 'Bob Analyst',    email: 'bob@finapp.com',     password: 'Analyst@123',  role: 'analyst' },
  { name: 'Carol Analyst',  email: 'carol@finapp.com',   password: 'Analyst@123',  role: 'analyst' },
  { name: 'Dave Analyst',   email: 'dave@finapp.com',    password: 'Analyst@123',  role: 'analyst' },
  { name: 'Eve Viewer',     email: 'eve@finapp.com',     password: 'Viewer@123',   role: 'viewer'  },
  { name: 'Frank Viewer',   email: 'frank@finapp.com',   password: 'Viewer@123',   role: 'viewer'  },
  { name: 'Grace Viewer',   email: 'grace@finapp.com',   password: 'Viewer@123',   role: 'viewer'  },
  { name: 'Hank Viewer',    email: 'hank@finapp.com',    password: 'Viewer@123',   role: 'viewer'  },
  { name: 'Ivy Viewer',     email: 'ivy@finapp.com',     password: 'Viewer@123',   role: 'viewer'  },
  { name: 'Jake Viewer',    email: 'jake@finapp.com',    password: 'Viewer@123',   role: 'viewer'  },
];

const INCOME_ENTRIES = [
  { category: 'Salary',       min: 40000, max: 120000, desc: ['Monthly salary credit', 'Base pay', 'Salary transfer'] },
  { category: 'Freelance',    min: 5000,  max: 40000,  desc: ['Project payment', 'Consultancy fee', 'Freelance invoice cleared'] },
  { category: 'Investments',  min: 1000,  max: 25000,  desc: ['Stock dividend', 'Mutual fund payout', 'SIP return', 'FD matured'] },
  { category: 'Business',     min: 10000, max: 60000,  desc: ['Business revenue', 'Client payment received', 'Product sales'] },
  { category: 'Revenue',      min: 8000,  max: 45000,  desc: ['Quarterly revenue', 'Service charge collected', 'Subscription income'] },
  { category: 'Loan',         min: 20000, max: 200000, desc: ['Personal loan disbursed', 'Home loan top-up', 'Credit line utilized'] },
  { category: 'Insurance',    min: 5000,  max: 50000,  desc: ['Insurance claim settled', 'Policy maturity payout'] },
  { category: 'Other',        min: 500,   max: 10000,  desc: ['Cash gift received', 'Referral bonus', 'Reimbursement', 'Tax refund'] },
];

const EXPENSE_ENTRIES = [
  { category: 'Rent',          min: 8000,  max: 30000,  desc: ['Monthly rent', 'Office rent paid', 'Apartment advance'] },
  { category: 'Utilities',     min: 500,   max: 5000,   desc: ['Electricity bill', 'Internet plan', 'Gas & water charges', 'Mobile recharge'] },
  { category: 'Operations',    min: 2000,  max: 20000,  desc: ['Office supplies', 'Staff refreshments', 'Printing & stationery', 'Maintenance charges'] },
  { category: 'Transportation', min: 500,  max: 8000,   desc: ['Cab rides', 'Fuel expense', 'Metro pass', 'Flight ticket'] },
  { category: 'Software',      min: 500,   max: 15000,  desc: ['SaaS subscription', 'Annual license renewal', 'Cloud hosting invoice', 'IDE subscription'] },
  { category: 'Healthcare',    min: 500,   max: 12000,  desc: ['Doctor consultation', 'Pharmacy purchase', 'Health checkup', 'Lab tests'] },
  { category: 'Marketing',     min: 2000,  max: 30000,  desc: ['Ad spend – Google', 'Social media promotion', 'Content creation fee', 'Influencer campaign'] },
  { category: 'Equipment',     min: 3000,  max: 80000,  desc: ['Laptop purchase', 'External monitor', 'Keyboard & mouse', 'Server hardware'] },
  { category: 'Education',     min: 1000,  max: 25000,  desc: ['Online course fee', 'Workshop registration', 'Training program', 'Book purchase'] },
  { category: 'Food',          min: 200,   max: 5000,   desc: ['Team lunch', 'Client dinner', 'Restaurant outing', 'Grocery run'] },
  { category: 'Other',         min: 200,   max: 8000,   desc: ['Miscellaneous spend', 'Bank charges', 'Subscription cancellation fee', 'Penalty fee'] },
];

const BUDGET_CATEGORIES = ['Rent', 'Utilities', 'Operations', 'Transportation', 'Software', 'Healthcare', 'Marketing', 'Equipment', 'Food'];
const BUDGET_LIMITS = { Rent: 25000, Utilities: 4000, Operations: 15000, Transportation: 6000, Software: 10000, Healthcare: 8000, Marketing: 20000, Equipment: 50000, Food: 6000 };

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const rand     = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick     = (arr)      => arr[Math.floor(Math.random() * arr.length)];
const randDate = (daysBack)  => {
  const d = new Date();
  d.setDate(d.getDate() - rand(0, daysBack));
  d.setHours(rand(8, 22), rand(0, 59), 0, 0);
  return d;
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   FINANCE APP — COMPREHENSIVE SEED SCRIPT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ── 1. Create / find users ──────────────────────────────────────────────────
  console.log('👤  Creating users...\n');
  const createdUsers = [];

  for (const u of USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      createdUsers.push(existing);
      console.log(`   ⏩  ${u.role.padEnd(8)} ${u.email}  (already exists)`);
    } else {
      const hashed = await bcrypt.hash(u.password, 10);
      const user   = await prisma.user.create({ data: { ...u, password: hashed } });
      createdUsers.push(user);
      console.log(`   ✅  ${u.role.padEnd(8)} ${u.email}`);
    }
  }

  // ── 2. Seed transactions ────────────────────────────────────────────────────
  console.log('\n💳  Seeding transactions...\n');
  let totalTxns = 0;

  for (const user of createdUsers) {
    // Clear old transactions for this run (keep fresh)
    await prisma.transaction.deleteMany({ where: { userId: user.id } });

    const txnCount  = rand(50, 120);
    const txnData   = [];

    for (let i = 0; i < txnCount; i++) {
      const isIncome = Math.random() < 0.35;   // ~35% income, ~65% expenses (realistic)
      const pool_    = isIncome ? INCOME_ENTRIES : EXPENSE_ENTRIES;
      const entry    = pick(pool_);

      txnData.push({
        userId:      user.id,
        type:        isIncome ? 'income' : 'expense',
        category:    entry.category,
        description: pick(entry.desc),
        amount:      rand(entry.min, entry.max) / (isIncome ? 1 : rand(1, 3)) | 0,
        date:        randDate(180),   // last 6 months
        isDeleted:   false,
      });
    }

    // Sort by date ascending before insert
    txnData.sort((a, b) => a.date - b.date);
    await prisma.transaction.createMany({ data: txnData });

    const income   = txnData.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = txnData.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    console.log(`   ${user.role.padEnd(8)} ${user.email.padEnd(30)} ${txnCount.toString().padStart(3)} txns  | income ₹${income.toLocaleString().padStart(9)} | expenses ₹${expenses.toLocaleString()}`);
    totalTxns += txnCount;
  }

  // ── 3. Seed budgets ─────────────────────────────────────────────────────────
  console.log('\n💰  Seeding budgets...\n');

  for (const user of createdUsers) {
    const budgets = [];
    for (const cat of BUDGET_CATEGORIES) {
      const variance = rand(-20, 20);              // ±20% from baseline
      const limit    = Math.round(BUDGET_LIMITS[cat] * (1 + variance / 100));
      budgets.push({ userId: user.id, category: cat.toLowerCase(), limit });
    }

    for (const b of budgets) {
      await prisma.budget.upsert({
        where:  { userId_category: { userId: b.userId, category: b.category } },
        update: { limit: b.limit },
        create: b,
      });
    }
    console.log(`   ✅  ${user.role.padEnd(8)} ${user.email} — ${budgets.length} budgets`);
  }

  // ── 4. Summary ──────────────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅  Done! Seeded ${createdUsers.length} users, ${totalTxns} transactions, ${createdUsers.length * BUDGET_CATEGORIES.length} budget entries.`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📋  Login Credentials:\n');
  const roleGroups = { admin: [], analyst: [], viewer: [] };
  USERS.forEach(u => roleGroups[u.role].push(u));
  for (const [role, users] of Object.entries(roleGroups)) {
    console.log(`   ${role.toUpperCase()}`);
    users.forEach(u => console.log(`     Email: ${u.email.padEnd(28)} Password: ${u.password}`));
    console.log();
  }
}

main()
  .catch(e => { console.error('❌ Seed error:', e.message); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
