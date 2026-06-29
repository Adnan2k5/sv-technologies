# SiteVault — Construction Expense Manager

A full-stack Progressive Web App (PWA) for construction company owners to track funds, manage projects, and monitor expenses. Installable on Android & iOS.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v3, Recharts, React Router |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT (jsonwebtoken) |
| Icons | Lucide React |

---

## Quick Start

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd sv
npm install          # installs concurrently at root
npm run install:all  # installs server + client deps
```

### 2. Configure environment variables

**Server** (`server/.env`):
```env
PORT=8000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/sv_expenses?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=30d
NODE_ENV=development
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Run in development

```bash
npm run dev   # starts both server (port 8000) and client (port 5173)
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## PWA — Install on Phone

### Android (Chrome)
1. Open the app URL in Chrome
2. Tap the **⋮** menu → **Add to Home Screen**
3. Tap **Install**

### iOS (Safari)
1. Open the app URL in Safari
2. Tap the **Share** button (bottom bar)
3. Tap **Add to Home Screen**
4. Tap **Add**

---

## Project Structure

```
sv/
├── server/                     # Express API
│   └── src/
│       ├── config/db.js        # MongoDB connection
│       ├── middleware/         # auth, asyncHandler, errorHandler
│       ├── models/             # User, Transaction, Project, Expense, Category
│       ├── controllers/        # Business logic per domain
│       ├── routes/             # Express routers
│       └── index.js            # App entry
│
└── client/                     # React PWA
    └── src/
        ├── api/                # Axios instance + service functions
        ├── context/            # AuthContext, ToastContext
        ├── components/
        │   ├── ui/             # Button, Modal, Badge, StatCard, Input, etc.
        │   ├── charts/         # BalanceTrendChart, ExpenseBreakdownChart, MonthlySpendChart
        │   ├── layout/         # Sidebar, BottomNav, AppLayout
        │   └── modals/         # TransactionModal, CreateProjectModal, AddExpenseModal
        ├── pages/              # Dashboard, Transactions, Projects, ProjectDetail, ExpenseDetail
        └── utils/format.js     # Currency, date, label formatters
```

---

## Key Features

- 💰 **Main Balance** — Credit / Debit funds with notes and dates
- 🔀 **Project Transfers** — Allocate funds from main balance to a project (tracked as a transaction)
- 📋 **Transaction Log** — Full history with filter by type and date range
- 🏗 **Project Management** — Create projects with initial funds, client, and location
- 📊 **Expense Tracking** — Add expenses by category (Material, Labour, Equipment, Transport, Misc)
- 📈 **Data Visualisation** — Balance trend chart, expense donut chart, monthly bar chart
- 🔍 **Category Detail** — Drill down into any expense category within a project
- 📱 **PWA** — Install on Android and iOS, works in any browser

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/transactions` | List transactions (filterable) |
| POST | `/api/transactions` | Create transaction (updates balance) |
| DELETE | `/api/transactions/:id` | Delete + reverse balance |
| GET | `/api/transactions/summary` | Credit/debit totals |
| GET | `/api/transactions/balance-trend` | Daily balance for chart |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Project + expense breakdown |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete + clean up |
| POST | `/api/projects/:id/allocate` | Transfer more funds |
| GET | `/api/expenses` | List expenses (filterable) |
| POST | `/api/expenses` | Add expense |
| PATCH | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/expenses/category-detail` | Detail view data |
| GET | `/api/categories` | List categories (auto-seeds defaults) |
| POST | `/api/categories` | Create category |
