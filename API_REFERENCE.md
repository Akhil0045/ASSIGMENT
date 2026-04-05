# FinanceOS — API Reference

**Base URL:** `http://localhost:5000/api`

**Authentication:** All protected routes require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

**Rate Limits:**
- Global API: 100 requests / 15 min per IP
- Auth endpoints: 5 requests / 15 min per IP

---

## 🔐 Auth — `/api/auth`

### 1. Register
- **POST** `/api/auth/register`
- **Auth:** None
- **Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```
- **Response:** `201` — `{ token, user: { id, name, email, role } }`

---

### 2. Login
- **POST** `/api/auth/login`
- **Auth:** None
- **Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```
- **Response:** `200` — `{ token, user: { id, name, email, role } }`

---

### 3. Get Current User
- **GET** `/api/auth/me`
- **Auth:** 🔒 Bearer Token (all roles)
- **Body:** None
- **Response:** `200` — `{ id, name, email, role }`

---

## 💳 Transactions — `/api/transactions`

> All routes require Bearer Token. RBAC scope is enforced server-side.
> - **Viewer:** sees only own transactions
> - **Analyst / Admin:** sees all users' transactions (filterable by `?email=` or `?userId=`)

---

### 4. Get Transactions (Paginated)
- **GET** `/api/transactions`
- **Auth:** 🔒 Bearer Token (all roles)
- **Query Params (all optional):**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Records per page (default: 10) |
| `type` | string | `income` or `expense` |
| `category` | string | Filter by category |
| `startDate` | ISO date | e.g. `2026-01-01` |
| `endDate` | ISO date | e.g. `2026-12-31` |
| `email` | string | Admin/Analyst only — filter by user email |
| `userId` | string | Admin/Analyst only — filter by user ID |

- **Response:** `200` — `{ data: [...], total, page, totalPages }`

---

### 5. Create Transaction
- **POST** `/api/transactions`
- **Auth:** 🔒 Bearer Token (admin, viewer only — analyst blocked)
- **Body (JSON — Viewer):**
```json
{
  "amount": 500.00,
  "type": "expense",
  "category": "food",
  "description": "Dinner",
  "date": "2026-04-04"
}
```
- **Body (JSON — Admin proxy for another user):**
```json
{
  "amount": 500.00,
  "type": "expense",
  "category": "food",
  "description": "Dinner on behalf",
  "date": "2026-04-04",
  "targetUserEmail": "viewer@example.com"
}
```
> ⚠️ Admin **must** include `targetUserEmail`. Viewers must NOT include it.

- **Response:** `201` — created transaction object

---

### 6. Update Transaction
- **PUT** `/api/transactions/:id`
- **Auth:** 🔒 Bearer Token (admin, viewer only)
- **Params:** `id` — transaction UUID
- **Body (JSON — all fields optional):**
```json
{
  "amount": 750.00,
  "type": "expense",
  "category": "transport",
  "description": "Flight ticket",
  "date": "2026-04-10"
}
```
- **Response:** `200` — updated transaction object

---

### 7. Delete Transaction
- **DELETE** `/api/transactions/:id`
- **Auth:** 🔒 Bearer Token (admin, viewer only)
- **Params:** `id` — transaction UUID
- **Response:** `200` — `{ message: "Record deleted" }`

---

## 📊 Analytics — `/api/analytics`

> All analytics routes require Bearer Token. Scope enforced server-side.
> Optional query params `?email=` / `?userId=` for Admin/Analyst filtering.

---

### 8. Get Balance Summary
- **GET** `/api/analytics/summary`
- **Auth:** 🔒 Bearer Token (all roles)
- **Query Params (optional for admin/analyst):**

| Param | Type | Description |
|-------|------|-------------|
| `email` | string | Filter to specific user |
| `userId` | string | Filter to specific user ID |

- **Response:** `200`
```json
{
  "totalIncome": 15000.00,
  "totalExpense": 8500.00,
  "balance": 6500.00,
  "savingsRate": 43.33
}
```

---

### 9. Get Chart Data
- **GET** `/api/analytics/charts`
- **Auth:** 🔒 Bearer Token (all roles)
- **Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| `startDate` | ISO date | e.g. `2026-03-01` |
| `endDate` | ISO date | e.g. `2026-04-04` |
| `email` | string | Admin/Analyst filter |
| `userId` | string | Admin/Analyst filter |

- **Response:** `200`
```json
{
  "daily": [{ "date": "2026-04-01", "income": 0, "expense": 500 }],
  "byCategory": [{ "category": "food", "total": 2000 }],
  "monthly": [{ "month": "2026-04", "income": 5000, "expense": 3000 }]
}
```

---

## 💰 Budget — `/api/budget`

> Budgets are per-user only — never aggregated across users.

---

### 10. Get Budget Status
- **GET** `/api/budget/status`
- **Auth:** 🔒 Bearer Token (all roles)
- **Query Params (optional for admin/analyst):**

| Param | Type | Description |
|-------|------|-------------|
| `email` | string | View specific user's budgets |
| `userId` | string | View specific user's budgets by ID |

> If admin/analyst sends no filter, returns empty array (budgets can't be aggregated).

- **Response:** `200`
```json
[
  {
    "id": "uuid",
    "category": "food",
    "limit": 5000.00,
    "spent": 3200.00,
    "remaining": 1800.00
  }
]
```

---

### 11. Set / Update Budget
- **POST** `/api/budget`
- **Auth:** 🔒 Bearer Token (admin, viewer only)
- **Body (JSON — Viewer):**
```json
{
  "category": "food",
  "limit": 5000
}
```
- **Body (JSON — Admin proxying for another user):**
```json
{
  "category": "rent",
  "limit": 15000,
  "targetUserEmail": "viewer@example.com"
}
```
> ℹ️ Upserts the budget — creates if not exists, updates limit if category already set.

- **Response:** `200` — budget record

---

## 👑 Admin — `/api/admin`

> All routes require Bearer Token + **Admin role only**.

---

### 12. List All Users
- **GET** `/api/admin/users`
- **Auth:** 🔒 Bearer Token (admin only)
- **Response:** `200` — array of user objects `[{ id, name, email, role, isActive }]`

---

### 13. Update User Role
- **PUT** `/api/admin/users/:id/role`
- **Auth:** 🔒 Bearer Token (admin only)
- **Params:** `id` — user UUID
- **Body (JSON):**
```json
{
  "role": "analyst"
}
```
> Valid roles: `viewer`, `analyst`, `admin`

- **Response:** `200` — updated user object

---

### 14. Update User Status (Activate / Deactivate)
- **PUT** `/api/admin/users/:id/status`
- **Auth:** 🔒 Bearer Token (admin only)
- **Params:** `id` — user UUID
- **Body (JSON):**
```json
{
  "isActive": false
}
```
- **Response:** `200` — updated user object

---

### 15. Delete User
- **DELETE** `/api/admin/users/:id`
- **Auth:** 🔒 Bearer Token (admin only)
- **Params:** `id` — user UUID
- **Response:** `200` — `{ message: "User deleted" }`

---

### 16. System Stats (Platform-Wide)
- **GET** `/api/admin/stats`
- **Auth:** 🔒 Bearer Token (admin only)
- **Response:** `200`
```json
{
  "totalUsers": 42,
  "totalTransactions": 1540,
  "totalIncome": 980000,
  "totalExpense": 640000
}
```

---

## 🔐 RBAC Permission Matrix

| Endpoint | Viewer | Analyst | Admin |
|----------|--------|---------|-------|
| `POST /auth/register` | ✅ | ✅ | ✅ |
| `POST /auth/login` | ✅ | ✅ | ✅ |
| `GET /auth/me` | ✅ | ✅ | ✅ |
| `GET /transactions` | ✅ own | ✅ all | ✅ all |
| `POST /transactions` | ✅ | ❌ | ✅ proxy |
| `PUT /transactions/:id` | ✅ own | ❌ | ✅ |
| `DELETE /transactions/:id` | ✅ own | ❌ | ✅ |
| `GET /analytics/summary` | ✅ own | ✅ all | ✅ all |
| `GET /analytics/charts` | ✅ own | ✅ all | ✅ all |
| `GET /budget/status` | ✅ own | ✅ filtered | ✅ filtered |
| `POST /budget` | ✅ own | ❌ | ✅ proxy |
| `GET /admin/users` | ❌ | ❌ | ✅ |
| `PUT /admin/users/:id/role` | ❌ | ❌ | ✅ |
| `PUT /admin/users/:id/status` | ❌ | ❌ | ✅ |
| `DELETE /admin/users/:id` | ❌ | ❌ | ✅ |
| `GET /admin/stats` | ❌ | ❌ | ✅ |

---

## 🧪 Postman Quick-Start Steps

1. **Register** a user via `POST /api/auth/register`
2. Copy the `token` from the response
3. In Postman → go to the **Authorization** tab → select **Bearer Token** → paste your token
4. You can now call any protected route
5. To test Admin routes, register an admin account or update a user role via your seed data

---

## ⚠️ Error Response Format

All errors follow this structure:
```json
{
  "message": "Descriptive error message here"
}
```

| Status Code | Meaning |
|-------------|---------|
| `400` | Validation error / Bad request |
| `401` | Unauthorized (missing/invalid JWT) |
| `403` | Forbidden (insufficient role) |
| `404` | Resource not found |
| `429` | Rate limit exceeded |
| `500` | Internal server error |
