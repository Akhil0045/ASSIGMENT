# FinanceOS - Professional Finance Management API

FinanceOS is a high-performance, enterprise-grade backend API developed to manage personal and corporate finances. Built with modern security practices and a robust Role-Based Access Control (RBAC) system, it provides a stable foundation for financial tracking and analytics.

---

## 🚀 Key Features

- **Advanced RBAC**: Granular permissions for Admins, Analysts, and Viewers.
- **Financial Analytics**: Deep-dive statistical endpoints for daily trends, category spending, and monthly summaries.
- **Budget Management**: Set and track budget limits by category with real-time progress calculations.
- **Security First**: 
  - JWT Authentication with secure payload handling.
  - Rate limiting for auth and sensitive API endpoints.
  - Helmet.js for secure HTTP headers.
- **ORM Excellence**: Powered by Prisma 7 and PostgreSQL for reliable data persistence.
- **API Documentation**: Interactive Swagger UI documentation.

---

## 🛠️ Technical Stack

- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma 7
- **Security**: bcrypt, jsonwebtoken, helmet, express-rate-limit
- **Documentation**: Swagger/OpenAPI

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js installed locally.
- A PostgreSQL instance (local or hosted on Render/Supabase).

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=5000
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secure-jwt-secret"
```

### 3. Installation
```bash
npm install
```

### 4. Database Setup
```bash
# Generate Prisma Client
npx prisma generate

# Push the schema to your database
npx prisma db push
```

### 5. Running the Application
```bash
# Development mode
npm run dev

# Production build & start
npm run build
npm start
```

---

## 📚 API Documentation
Once the server is running, visit the interactive Swagger documentation at:
`http://localhost:5000/api-docs`

---

## 🧪 Health Monitoring
Check the API status at:
`GET /health`
