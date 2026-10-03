# Stock Meuve API Documentation

## Overview

Stock Meuve is a Laravel-based API for managing stock movements, products, shops, and reports in a multi-shop inventory management system.

## Base URL

```
https://your-domain.com/api
```

## Authentication

The API uses Laravel Sanctum for authentication. Most endpoints require a valid Bearer token.

### Authentication Headers

```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

## Rate Limiting

- **Public routes**: 5-10 requests per minute
- **Authenticated routes**: 120 requests per minute

## API Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "password"
}
```

**Response:**
```json
{
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "user@example.com"
    },
    "token": "1|abc123..."
}
```

#### Register
```http
POST /api/auth/register
```

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "user@example.com",
    "password": "password",
    "password_confirmation": "password"
}
```

#### Logout (Authenticated)
```http
POST /api/auth/logout
```

#### Get Current User (Authenticated)
```http
GET /api/auth/me
```

#### Update Profile (Authenticated)
```http
PUT /api/auth/profile
```

#### Delete Account (Authenticated)
```http
DELETE /api/auth/account
```

### Products

#### List Products
```http
GET /api/products
```

#### Create Product
```http
POST /api/products
```

**Request Body:**
```json
{
    "name": "Product Name",
    "description": "Product description",
    "sku": "SKU123",
    "price": 99.99
}
```

#### Show Product
```http
GET /api/products/{id}
```

#### Update Product
```http
PUT /api/products/{id}
```

#### Delete Product
```http
DELETE /api/products/{id}
```

### Shops

#### List Shops
```http
GET /api/shops
```

#### Create Shop
```http
POST /api/shops
```

**Request Body:**
```json
{
    "name": "Shop Name",
    "address": "123 Main St",
    "phone": "+1234567890"
}
```

#### Show Shop
```http
GET /api/shops/{id}
```

#### Update Shop
```http
PUT /api/shops/{id}
```

#### Delete Shop
```http
DELETE /api/shops/{id}
```

### Stock Movements

#### List Movements
```http
GET /api/movements
```

**Query Parameters:**
- `shop_id`: Filter by shop
- `product_id`: Filter by product
- `type`: Filter by movement type (opening, receipt, distribution, correction, spoil)
- `date_from`: Filter by start date
- `date_to`: Filter by end date

#### Opening Stock
```http
POST /api/movements/opening
```

**Request Body:**
```json
{
    "shop_id": 1,
    "product_id": 1,
    "quantity": 100,
    "notes": "Initial stock"
}
```

#### Stock Receipt
```http
POST /api/movements/receipt
```

**Request Body:**
```json
{
    "shop_id": 1,
    "product_id": 1,
    "quantity": 50,
    "supplier": "Supplier Name",
    "notes": "New stock received"
}
```

#### Stock Distribution
```http
POST /api/movements/distribution
```

**Request Body:**
```json
{
    "from_shop_id": 1,
    "to_shop_id": 2,
    "product_id": 1,
    "quantity": 25,
    "notes": "Stock transfer"
}
```

#### Stock Correction
```http
POST /api/movements/correction
```

**Request Body:**
```json
{
    "shop_id": 1,
    "product_id": 1,
    "quantity": -5,
    "reason": "Damaged items",
    "notes": "Inventory adjustment"
}
```

#### Spoiled Stock
```http
POST /api/movements/spoil
```

**Request Body:**
```json
{
    "shop_id": 1,
    "product_id": 1,
    "quantity": 10,
    "reason": "Expired",
    "notes": "Items expired"
}
```

#### Confirm Spoilage
```http
PUT /api/movements/spoil/{id}/confirm
```

#### Reject Spoilage
```http
PUT /api/movements/spoil/{id}/reject
```

### Reports

#### Summary Report
```http
GET /api/reports/summary
```

#### Report by Shop
```http
GET /api/reports/by-shop
```

**Query Parameters:**
- `shop_id`: Specific shop ID
- `date_from`: Start date
- `date_to`: End date

#### Report by Product
```http
GET /api/reports/by-product
```

**Query Parameters:**
- `product_id`: Specific product ID
- `date_from`: Start date
- `date_to`: End date

#### Spoilage Report
```http
GET /api/reports/spoils
```

**Query Parameters:**
- `shop_id`: Filter by shop
- `date_from`: Start date
- `date_to`: End date

### Export

#### Export Movements
```http
GET /api/export/movements
```

**Query Parameters:**
- `format`: `csv` or `xlsx` (default: csv)
- `date_from`: Start date
- `date_to`: End date

#### Export Products
```http
GET /api/export/products
```

**Query Parameters:**
- `format`: `csv` or `xlsx` (default: csv)

## Idempotency

For movement creation endpoints (opening, receipt, distribution, correction, spoil), the API supports idempotency to prevent duplicate operations.

**Idempotency Key Header:**
```
Idempotency-Key: unique-key-for-request
```

## Error Responses

The API returns standard HTTP status codes with JSON error responses:

```json
{
    "message": "Error description",
    "errors": {
        "field": ["Error message"]
    }
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Data Models

### Product
```json
{
    "id": 1,
    "name": "Product Name",
    "description": "Description",
    "sku": "SKU123",
    "price": 99.99,
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

### Shop
```json
{
    "id": 1,
    "name": "Shop Name",
    "address": "123 Main St",
    "phone": "+1234567890",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

### Movement
```json
{
    "id": 1,
    "type": "receipt",
    "shop_id": 1,
    "product_id": 1,
    "quantity": 50,
    "notes": "New stock received",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

## Testing

Use the provided collection file `stockflow-api.rest` for testing the API with REST Client extensions in VS Code or similar tools.

## Deployment

The API is configured for deployment on:
- Vercel (serverless)
- Render
- Docker
- Traditional hosting with Apache/Nginx

## Support

For issues and questions, refer to the project repository or contact the development team.
