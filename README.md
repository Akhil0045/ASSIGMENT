# Personal Finance Management System

A full-stack web application designed for users to track incomes and expenses securely. 

## Features

- **User Authentication**: Secure register and login functionality using JWT and bcrypt.
- **Transaction Management**: Add, edit, and soft-delete financial transactions.
- **Categorization & Filtering**: Filter transactions by type (income/expense) or search by category name.
- **Dashboard Summary**: Real-time total balance, income, and expense summaries.
- **Pagination**: Easy navigation through transaction history.
- **Security Best Practices**: Includes Helmet for security headers, express-rate-limit for protecting APIs, and Joi for rigorous input validation. 
- **Dynamic Frontend**: Modern, dynamic design built from scratch without external UI frameworks, making use of pure CSS custom properties, grid/flex layouts, and hover effect micro-interactions.

## Tech Stack

**Frontend**:
- React (Vite)
- React Router DOM
- Axios
- jwt-decode
- Plain CSS (Custom Design System, variables, responsive)

**Backend**:
- Node.js & Express
- MongoDB (Mongoose)
- jsonwebtoken (JWT)
- bcrypt
- joi (Validation)
- morgan (Logging)
- helmet & express-rate-limit (Security)

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or a remote URI)

### Local Setup

1. **Clone the repository** (or navigate to `e:\Finance_mangement`).

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Ensure .env is populated: PORT, MONGODB_URI, JWT_SECRET
   npm run start
   ```
   *(For development, `npm run dev` can be used assuming a nodemon script is added. Otherwise `node server.js` works).*

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   This will start the Vite frontend server (typically on `http://localhost:5173`).

### Project Architecture & Tradeoffs

#### Folder Structure
The backend embraces a layered MVC-style structure emphasizing Separation of Concerns:
- **Routes**: Define incoming endpoints and attach middleware.
- **Middlewares**: Protect routes, validate inputs, handle errors globally.
- **Controllers**: Thin request handlers mapping inputs to services.
- **Services**: Where core business logic resides (e.g., retrieving from models, computing balance).
- **Models**: Mongoose schemas acting as the single source of truth for the DB.

The frontend uses contextual state management via `AuthContext` to avoid prop drilling and provides robust routing through `react-router-dom`.

#### Assumptions
- Users are independent and isolated (User A cannot view User B matters).
- The system defaults to local MongoDB connections.
- Soft deletes are preferable over hard deletes for financial auditing preservation.
- The UI leverages pure CSS over utility libraries per requirements, but maintains modern aesthetic traits such as transition states and custom palettes.
