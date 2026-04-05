# 💰 Finance Management System — Backend API

A production-ready backend for a Finance Dashboard System built with **Node.js**, **Express**, **PostgreSQL**, and **Prisma ORM**. Features full RBAC (Role-Based Access Control), financial transaction management, budget tracking, and dashboard analytics.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v18+ |
| Framework | Express.js v5 |
| Database | PostgreSQL (live) |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Auth | JWT (30-day tokens) |
| Validation | Joi |
| Security | Helmet, CORS, Rate Limiting |
| Password | bcrypt |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL database (local or hosted)

### Setup

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DB credentials and JWT secret

# 3. Push schema to database
npx prisma db push

# 4. Generate Prisma client
npx prisma generate

# 5. Seed demo data (3 role-based users)
node prisma/seed.js

# 6. Start development server
npm run dev
```

### Environment Variables (`.env`)

```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/finance_db?schema=public
JWT_SECRET=your_64_char_secret_here
```

---

## 👥 Roles & Permissions

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| View transactions | ✅ | ✅ | ✅ |
| View dashboard / charts | ✅ | ✅ | ✅ |
| View budgets | ✅ | ✅ | ✅ |
| Create / edit / delete transactions | ❌ | ✅ | ✅ |
| Set budgets | ❌ | ✅ | ✅ |
| Manage users (list, role, status) | ❌ | ❌ | ✅ |
| System-wide analytics | ❌ | ❌ | ✅ |

### Demo Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| 👑 Admin | `admin@finance.com` | `Admin@123` |
| 🔬 Analyst | `analyst@finance.com` | `Analyst@123` |
| 👁️ Viewer | `viewer@finance.com` | `Viewer@123` |

---

## 📡 API Reference

### Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

---

### 🔐 Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Register new user |
| `POST` | `/login` | Public | Login and receive JWT |
| `GET` | `/me` | Any role | Get current user profile |

**Register body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123"
}
```

**Login body:**
```json
{
  "email": "analyst@finance.com",
  "password": "Analyst@123"
}
```

**Login response:**
```json
{
  "id": "uuid",
  "name": "Analyst User",
  "email": "analyst@finance.com",
  "role": "analyst",
  "isActive": true,
  "token": "eyJhbGc..."
}
```

---

### 💳 Transactions (`/api/transactions`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | All roles | List transactions (paginated, filtered) |
| `POST` | `/` | Analyst, Admin | Create a transaction |
| `PUT` | `/:id` | Analyst, Admin | Update a transaction |
| `DELETE` | `/:id` | Analyst, Admin | Soft-delete a transaction |
| `GET` | `/summary` | All roles | Balance summary (income/expense/net) |
| `GET` | `/charts` | All roles | Chart data (pie + trend) |

**GET `/transactions` query params:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `type` | string | Filter: `income` or `expense` |
| `category` | string | Filter by category |
| `search` | string | Full-text search on category + description |
| `startDate` | string | Date range start (YYYY-MM-DD) |
| `endDate` | string | Date range end (YYYY-MM-DD) |

**Create transaction body:**
```json
{
  "amount": 5000,
  "type": "income",
  "category": "Salary",
  "description": "Monthly salary",
  "date": "2026-04-01"
}
```

---

### 📊 Dashboard (`/api/transactions/summary`, `/api/transactions/charts`)

**GET `/summary`** — Returns:
```json
{
  "income": 96500,
  "expenses": 35300,
  "balance": 61200
}
```

**GET `/charts?startDate=2026-03-01&endDate=2026-04-04`** — Returns:
```json
{
  "expensesByCategory": [
    { "name": "Rent", "value": 15000 },
    { "name": "Food", "value": 5300 }
  ],
  "trends": [
    { "date": "2026-04-01", "income": 75000, "expense": 15000 }
  ]
}
```

---

### 💰 Budgets (`/api/budget`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/status` | All roles | Get budgets with spent vs limit |
| `POST` | `/` | Analyst, Admin | Set/update a budget limit |

**Set budget body:**
```json
{
  "category": "food",
  "limit": 6000
}
```

---

### 👨‍💼 Admin (`/api/admin`) — Admin only

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/users` | List all users (with transaction count) |
| `PUT` | `/users/:id/role` | Change a user's role |
| `PUT` | `/users/:id/status` | Activate/deactivate a user |
| `DELETE` | `/users/:id` | Deactivate (soft-delete) a user |
| `GET` | `/stats` | System-wide financial summary |

**GET `/admin/users` query params:**
- `role` — Filter by role (`viewer`, `analyst`, `admin`)
- `isActive` — Filter by status (`true` or `false`)
- `page`, `limit` — Pagination

**Update role body:**
```json
{ "role": "analyst" }
```

**Update status body:**
```json
{ "isActive": false }
```

**System stats response:**
```json
{
  "totalUsers": 3,
  "totalTransactions": 42,
  "totalIncome": 250000,
  "totalExpenses": 98000,
  "netBalance": 152000
}
```

---

## 🗄️ Data Models

### User
```
id          UUID (PK)
name        String
email       String (UNIQUE)
password    String (bcrypt hashed)
role        String (viewer | analyst | admin) DEFAULT viewer
isActive    Boolean DEFAULT true
createdAt   DateTime
updatedAt   DateTime
```

### Transaction
```
id          UUID (PK)
userId      UUID (FK → User)
amount      Float
type        String (income | expense)
category    String
description String?
date        DateTime
isDeleted   Boolean DEFAULT false (soft delete)
createdAt   DateTime
updatedAt   DateTime
```

### Budget
```
id          UUID (PK)
userId      UUID (FK → User)
category    String
limit       Float
createdAt   DateTime
updatedAt   DateTime
UNIQUE(userId, category)
```

---

## 🛡️ Security Features

- **JWT Authentication** — All protected routes verify JWT Bearer tokens
- **Role-Based Access Control** — Enforced via `authorize()` middleware
- **Active Status Check** — Deactivated users cannot access any endpoint
- **Rate Limiting** — 100 req/15min per IP via `express-rate-limit`
- **Helmet** — Secure HTTP headers
- **Input Validation** — Joi schemas on all write operations
- **Soft Delete** — Transactions are never hard-deleted; `isDeleted` flag used
- **bcrypt** — Passwords hashed with salt rounds = 10

---

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Database schema (User, Transaction, Budget)
│   └── seed.js             # Demo data seeder
├── prisma.config.ts        # Prisma 7 configuration
├── src/
│   ├── app.js              # Express app setup
│   ├── config/
│   │   └── db.js           # Prisma + pg adapter initialization
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   ├── budgetController.js
│   │   └── adminController.js
│   ├── middlewares/
│   │   ├── auth.js         # JWT protect middleware
│   │   ├── authorize.js    # RBAC role guard
│   │   ├── validate.js     # Joi validation wrapper
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── budgetRoutes.js
│   │   └── adminRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   └── transactionService.js
│   └── validators/
│       ├── userValidator.js
│       ├── transactionValidator.js
│       └── budgetValidator.js
└── server.js               # Entry point
```

---

## 🧪 Testing the API

### Using curl:

```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finance.com","password":"Admin@123"}'

# List all users (admin only)
curl http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create a transaction (analyst/admin only)
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":5000,"type":"income","category":"Salary","date":"2026-04-01"}'

# Search transactions
curl "http://localhost:5000/api/transactions?search=grocery&type=expense" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚙️ Assumptions & Design Decisions

1. **Soft Delete Only** — Transactions are flagged `isDeleted: true` and filtered out. This preserves historical data integrity and prevents accidental data loss.

2. **Default Role: Viewer** — All self-registered users default to `viewer` to follow the principle of least privilege. Admins upgrade roles as needed.

3. **Admin Cannot Downgrade Self** — An admin cannot change their own role or deactivate themselves to prevent lockout.

4. **User Deletion = Deactivation** — Hard-deleting users would cascade-delete all their transactions. Instead, the admin endpoint deactivates users (preserving their data) while blocking their access.

5. **Search Scope** — The `search` query searches both `category` and `description` fields. Using `category` and `search` together gives `search` priority.

6. **Budget Upsert** — Setting a budget creates it if it doesn't exist or updates the limit if it does. One budget entry per user per category (enforced by DB unique constraint).

7. **Prisma Driver Adapter** — Using `@prisma/adapter-pg` for full Node.js v24 compatibility, bypassing the native query engine binding issues.
