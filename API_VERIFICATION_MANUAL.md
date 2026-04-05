# FinanceOS — API Verification Manual (Step-by-Step)

This manual provides a comprehensive, role-by-role guide to verifying every endpoint in the FinanceOS API ecosystem. It is designed to be used with **Swagger UI** for immediate feedback and visual confirmation.

---

## 🛠️ Step 0: Environment Setup

Before starting the verification labs, ensure the environment is in a known state.

### 1. Start the Backend Server
Navigate to the `backend` directory and ensure the server is running:
```bash
cd backend
npm run dev
```
*Verify the message: `Server running on port 5000`.*

### 2. Reset the Database (Optionally)
To ensure all test accounts exist, run the seeding script:
```bash
npx prisma db seed
```
**Test Accounts Ready:**
- **👑 Admin**: `admin@finance.com` / `Admin@123`
- **🔬 Analyst**: `analyst@finance.com` / `Analyst@123`
- **👁️ Viewer**: `viewer@finance.com` / `Viewer@123`

---

## 🔐 Core Methodology: JWT Authorization

All labs follow this sequence to authenticate in Swagger UI:
1.  Navigate to `http://localhost:5000/api-docs`.
2.  Open the **`POST /api/auth/login`** endpoint.
3.  Click **"Try it out"**, enter credentials, and click **"Execute"**.
4.  Copy the long `token` string from the Response Body.
5.  Scroll to the top and click the 🔓 **"Authorize"** button.
6.  Paste the token into the Value field and click **"Authorize"**.
7.  Click **"Close"**. You are now authenticated for that role.

---

## 🧪 LAB A: The Viewer (End-User) Workflow

Viewers are independent users who manage their own data.

### Step 1: Registration
- **Endpoint**: `POST /api/auth/register`
- **Action**: Register a fresh user (e.g., `newuser@test.com`).
- **Verify**: Response `201 Created` with a new JWT.

### Step 2: Personal Transactions (CRUD)
- **Create**: `POST /api/transactions`
    - Body: `{ "amount": 1500, "type": "expense", "category": "Rent", "description": "Home" }`
    - **Verify**: Response `201` with created transaction ID.
- **Read**: `GET /api/transactions`
    - **Verify**: Only your own transactions appear.
- **Update**: `PUT /api/transactions/{id}`
    - **Verify**: Updates are reflected (200 OK).
- **Delete**: `DELETE /api/transactions/{id}`
    - **Verify**: Record is soft-deleted (sets `isDeleted: true` in DB).

### Step 3: Budget Management
- **Set**: `POST /api/budget`
    - Body: `{ "category": "food", "limit": 5000 }`
    - **Verify**: Upsert works correctly (200 OK).
- **View Status**: `GET /api/budget/status`
    - **Verify**: Correctly calculates "spent" and "remaining" based on transactions.

---

## 🧪 LAB B: The Analyst (Auditor) Workflow

Analysts have platform-wide visibility but zero write access.

### Step 4: Auditor Visibility
- **Action**: Login as `analyst@finance.com`.
- **Verify Global Logs**: `GET /api/transactions`.
    - **Observe**: You can see transactions from ANY user in the system.
- **Verify Global Stats**: `GET /api/analytics/summary`.
    - **Observe**: Aggregates data platform-wide.

### Step 5: Security Hardening (Negative Testing)
- **Action**: Attempt to create a transaction (`POST /api/transactions`).
- **Verify**: Response **`403 Forbidden`** (Access denied. Required role: admin, viewer).
- **Action**: Attempt to access Admin stats (`GET /api/admin/stats`).
- **Verify**: Response **`403 Forbidden`** (Access denied. Required role: admin).

---

## 🧪 LAB C: The Admin (Superuser) Workflow

Admins manage the system and can act on behalf of users.

### Step 6: Platform Management
- **Global Stats**: `GET /api/admin/stats` (Confirmed 200 OK).
- **User Directory**: `GET /api/admin/users`.
- **Role Elevation**: `PUT /api/admin/users/{id}/role` (Change roles to 'analyst' or 'admin').

### Step 7: Admin Proxy Operations
- **Log For User**: `POST /api/transactions`.
    - Body: `{ "targetUserEmail": "viewer@finance.com", "amount": 500, ... }`
    - **Observe**: Transaction is correctly attributed to the viewer, not the admin.
- **Set User Budget**: `POST /api/budget`.
    - Body: `{ "targetUserEmail": "viewer@finance.com", "category": "utility", "limit": 2000 }`
    - **Observe**: Admin overrides or sets the user's budget successfully.

---

## 📖 Troubleshooting Guide

| Status | Meaning | Solution |
|--------|---------|----------|
| **401** | Unauthorized | Your JWT token has expired or is invalid. Re-login and re-authorize. |
| **403** | Forbidden | Your current role doesn't have permission for this endpoint. |
| **404** | Not Found | Check if the ID or Email you are searching for actually exists in the DB. |
| **429** | Rate Limit | You've made too many requests. Wait 15 minutes or check server config. |

---

> [!TIP]
> **Pro Tip**: Use the **"targetUserEmail"** query param in Analytics as an Admin to see a specific user’s dashboard exactly as they see it.
