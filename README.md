# charlyHB

A high-performance multi-tenant inventory ledger engine and distribution management platform built with **Laravel 11** (API) and **Next.js 14** (Client).

---

## 📁 Repository Structure

```
charlyHB/
├── .github/              ← CI/CD workflows
├── app/
│   ├── backend/          ← Laravel 11 REST API
│   ├── frontend/         ← Next.js 14 App Router client
│   └── shared/           ← Shared contracts & schema definitions
├── docs/                 ← Architecture, setup, and troubleshooting documentation
└── README.md
```

---

## 🚀 Key Features

- **Double-Entry Ledger Invariant:** Inventory balances are calculated strictly from immutable, confirmed movements — zero in-place mutations.
- **Pessimistic Concurrency Protection:** Dispatches, negative corrections, and confirmed spoils employ `lockForUpdate()` within atomic transactions to eliminate double-selling and race conditions.
- **Atomic Multi-Item Operations:** Opening stock and bulk distributions execute under full rollback guarantees.
- **Zero N+1 Query Overhead:** Real-time stock levels are computed via SQL aggregate subqueries (`withSum`).
- **Standardized API Contracts:** Uniform `{ status, message, data, errors, meta }` envelopes across all endpoints.
- **Idempotency Guard:** Repeated mobile submissions with duplicate `X-Idempotency-Key` return cached results without re-executing writes.

---

## 📚 Documentation

- **[Operational Troubleshooting Guide](./docs/troubleshooting.md)** — Locking, rollback guarantees, CORS, and database drivers.
- **[REST API Reference](./docs/API.md)** — Endpoints, request schemas, and sample payloads.
- **[System Architecture](./docs/ARCHITECTURE.md)** — Domain boundaries, entity relationships, and ledger structure.

---

## 🛠️ Technology Stack

- **Backend:** Laravel 11, PHP 8.2+ (in `app/backend`)
- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS (in `app/frontend`)
- **Database:** SQLite (local/testing), MySQL / PostgreSQL (staging/production)
- **Auth:** Laravel Sanctum (Bearer Token / Stateful SPA)
- **Testing:** PHPUnit (Feature & Unit test suites)

---

## 🚀 Local Development Setup

### 1. Backend Setup (Laravel API)

```bash
# 1. Navigate to backend directory
cd app/backend

# 2. Install dependencies
composer install

# 3. Configure environment
cp .env.example .env
php artisan key:generate

# 4. Create database & run migrations
touch database/database.sqlite
php artisan migrate --seed

# 5. Start backend server (default: port 8000)
php artisan serve
```

### 2. Frontend Setup (Next.js)

```bash
# 1. Navigate to frontend directory
cd app/frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.local.example .env.local  # Set NEXT_PUBLIC_API_URL=http://localhost:8000/api

# 4. Start frontend development server
npm run dev
```
The frontend will be available at `http://localhost:3000`.

---

## 🧪 Automated Testing

Run the feature and unit test suites from `app/backend`:

```bash
cd app/backend

# Run all automated tests
php artisan test

# Run specific feature test suites
php artisan test tests/Feature/Movements
php artisan test tests/Feature/MultiTenancy
php artisan test tests/Feature/Products
```

---

## 📄 License

This project is licensed under the MIT License.
