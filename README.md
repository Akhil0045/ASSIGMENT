# FinanceOS — Enterprise Personal Finance Management

A modern, enterprise-grade Personal Finance Management System built with a focus on security, data isolation, and robust Role-Based Access Control (RBAC).

---

## 🚀 Key Features

- **Multi-Role RBAC**: Granular permissions for **Viewer**, **Analyst**, and **Admin**.
- **Data Scoping**: Viewers are isolated to their own records; Analysts can audit platform-wide data.
- **Admin Proxy Mode**: Admins can log transactions and manage budgets on behalf of specific users.
- **Enterprise Security**: Rate limiting, Helmet headers, JWT authentication, and Joi validation.
- **Real-time Analytics**: Summary dashboard and time-series charts for financial health tracking.
- **Detailed API Specs**: Interactive Swagger UI and comprehensive documentation.

---

## 🛠️ Tech Stack

### Backend
- **Core**: Node.js & Express
- **Database**: **PostgreSQL** (Managed via **Prisma ORM**)
- **Authentication**: JSON Web Tokens (JWT) & bcrypt
- **Security**: Helmet, express-rate-limit, CORS
- **Validation**: Joi (Request schemas)
- **Documentation**: Swagger UI & OpenAPI 3.0

### Frontend
- **Core**: React (Vite)
- **Navigation**: React Router DOM
- **Design System**: Vanilla CSS (Custom properties, grid/flex layouts, micro-animations)
- **Networking**: Axios

---

## 🔐 Role-Based Access Control (RBAC)

| Endpoint | Viewer | Analyst | Admin |
|----------|:------:|:-------:|:-----:|
| `POST /auth/register` | ✅ | ✅ | ✅ |
| `GET /api/transactions` | ✅ own | ✅ all | ✅ all |
| `POST /api/transactions` | ✅ | ❌ | ✅ proxy |
| `PUT /api/transactions/:id` | ✅ own | ❌ | ✅ |
| `DELETE /api/transactions/:id` | ✅ own | ❌ | ✅ |
| `GET /api/analytics/summary`| ✅ own | ✅ all | ✅ all |
| `GET /api/analytics/charts` | ✅ own | ✅ all | ✅ all |
| `GET /api/budget/status` | ✅ own | ✅ filtered| ✅ filtered |
| `POST /api/budget` | ✅ own | ❌ | ✅ proxy |
| `GET /api/admin/*` | ❌ | ❌ | ✅ |

> [!IMPORTANT]
> **Verified RBAC Conditions**:
> 1. **Analyst**: Cannot edit *any* data; strictly limited to analysis and auditing.
> 2. **User (Viewer)**: Can fully manage their *own* data (entries and budgets).
> 3. **Admin**: Can view, edit, or delete *any* user's data and create entries for any account via `targetUserEmail`.

> [!NOTE]
> **Admin Proxy Mode**: Admin operations (POST/PUT) require a `targetUserEmail` to ensure clear ownership and auditability.

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL instance running

### Local Development

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Ensure .env setup (DATABASE_URL, JWT_SECRET, PORT)
   npx prisma migrate dev      # Applies migrations
   npx prisma db seed          # Loads test accounts (Admin, Analyst, Viewer)
   npm run dev                 # Starts Nodemon dev server
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🧪 API Verification & Reports

All features are systematically tested against the RBAC matrix. You can view the latest verification reports below:

1. **[Viewer Test Report](API_VERIFICATION_REPORT.md)**: Standard user workflow verification.
2. **[Admin & Analyst Audit](ADMIN_ANALYTICS_TEST_REPORT.md)**: Detailed verification of administrative and analytical roles.
3. **Interactive API Specs**: Visit `http://localhost:5000/api-docs` on a running server.

---

## 📜 Assumptions & Tradeoffs
- **PostgreSQL Migration**: The system was successfully migrated from MongoDB to PostgreSQL for better relational management of transactions and budgets.
- **Soft Deletes**: Transactions use soft-deletion for data preservation.
- **Budget Aggregation**: Budgets are strictly per-user and cannot be aggregated across the platform (unlike transactions).
