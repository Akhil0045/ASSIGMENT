const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Handle IPv6 resolution for 'localhost' in Node v18+ by defaulting to 127.0.0.1
// The DATABASE_URL in .env has been updated to use 127.0.0.1
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL Connected via Prisma (using Pg Adapter)');
  } catch (error) {
    console.error(`Error connecting to DB: ${error.message}`);
    // Non-fatal if DB not yet initialized for migration/push
  }
};

module.exports = { prisma, connectDB };
