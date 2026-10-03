# charlyHB Operational & Architectural Troubleshooting Guide

This guide details common operational failure states, known concurrency behavior, and configuration gotchas.

---

## 1. Concurrency, Race Conditions & Pessimistic Locks

### Symptom: `409 Conflict: Insufficient stock for [Product Name]`
- **Cause:** charlyHB utilizes strict pessimistic row-level locking (`Product::lockForUpdate()`) within database transactions for all stock deduction movements (`distribution`, `spoil`, and negative `correction`).
- **Resolution:** This is the expected safety invariant. Stock deductions are atomic and double-selling or negative balances are strictly rejected at the database level.
- **Client Strategy:** On receiving HTTP `409 Conflict`, the frontend UI refreshes the active product balance from `/api/products` and warns the user that stock was depleted by a concurrent transaction.

---

## 2. Opening Stock Multi-Item Operations

### Symptom: `409 Conflict: Opening stock already recorded today for [Product Name]`
- **Cause:** Opening stock is strictly restricted to one confirmed entry per product per calendar day (`recorded_at` date = current date).
- **Rollback Guarantee:** Multi-item opening stock submissions are wrapped in an atomic `DB::transaction()`. If any single product in a batch was already recorded today, the **entire batch is rolled back** with zero partial writes.
- **Resolution:** If starting stock needs adjustment after initial entry, use `/api/movements/correction` instead of opening stock.

---

## 3. Cross-Origin Resource Sharing (CORS) & Sanctum Auth

### Symptom: Network error or CORS blocked when calling `/api/*` from Next.js
- **Check 1: `FRONTEND_URL` in `.env`**
  Ensure `.env` matches your frontend port (default: `FRONTEND_URL=http://localhost:3000`).
- **Check 2: `config/cors.php`**
  Verify that `supports_credentials` is set to `true` and the origin is permitted.
- **Check 3: Sanctum Bearer Token**
  For API-only token authentication, supply the header `Authorization: Bearer <token>` and `Accept: application/json` on every request.

---

## 4. Database Drivers & SQLite Concurrency

### Symptom: `database is locked` error during automated test runs
- **Cause:** SQLite defaults to single-writer access. Rapid concurrent writes in high-frequency integration tests can cause write lock contention.
- **Resolution:**
  - In `phpunit.xml`, tests default to in-memory SQLite: `<env name="DB_CONNECTION" value="sqlite"/>` and `<env name="DB_DATABASE" value=":memory:"/>`.
  - For staging/production multi-user loads, always use MySQL or PostgreSQL as outlined in `.env.example`.

---

## 5. Standardized Error Envelopes

All errors emitted by the API follow this uniform structure:
```json
{
  "status": "error",
  "message": "Human-readable summary of failure.",
  "errors": {
    "field_name": [
      "Validation or rule failure message."
    ]
  }
}
```
If you encounter unformatted HTML or Laravel default pages, ensure the HTTP request contains `Accept: application/json`.
