# Stock Meuve Documentation

Welcome to the Stock Meuve documentation. This comprehensive guide covers everything you need to know about the Stock Meuve inventory management system.

## 📚 Documentation Sections

### [API Documentation](./API.md)
Complete REST API reference with all endpoints, request/response formats, authentication details, and error handling.

### [Setup Guide](./SETUP.md)
Step-by-step installation and configuration instructions for development and production environments.

### [Architecture Documentation](./ARCHITECTURE.md)
Detailed system architecture, design patterns, data models, and technical implementation details.

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stock-meuve
   ```

2. **Install dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Setup database**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

5. **Start development server**
   ```bash
   php artisan serve
   ```

6. **Access API documentation**
   ```
   http://localhost:8000/docs
   ```

## 🏗️ System Overview

Stock Meuve is a Laravel-based inventory management system that provides:

- **Multi-shop Support**: Manage inventory across multiple locations
- **Real-time Tracking**: Monitor stock movements in real-time
- **Comprehensive Reporting**: Detailed reports and analytics
- **RESTful API**: Clean, well-documented API for integration
- **Modern Architecture**: Scalable, maintainable codebase

## 📋 Key Features

### Inventory Management
- Product catalog management
- Shop/location management
- Stock movement tracking
- Automated calculations

### Movement Types
- **Opening Stock**: Initial inventory setup
- **Receipt**: Stock from suppliers
- **Distribution**: Transfer between shops
- **Correction**: Manual adjustments
- **Spoilage**: Damaged/expired items

### Reporting & Analytics
- Summary reports
- Shop-wise analysis
- Product-wise tracking
- Spoilage reporting
- Data export capabilities

### Security & Performance
- Token-based authentication (Laravel Sanctum)
- Rate limiting
- Input validation
- Caching optimization
- Queue system for background jobs

## 🔧 Technology Stack

### Backend
- **Framework**: Laravel 12
- **Language**: PHP 8.2+
- **Database**: MySQL/PostgreSQL
- **Authentication**: Laravel Sanctum
- **Queue**: Redis/Database
- **Cache**: Redis

### API Documentation
- **OpenAPI**: Scramble integration
- **Interactive**: Swagger UI
- **Auto-generated**: From code annotations

### Development Tools
- **Testing**: PHPUnit
- **Code Style**: Laravel Pint
- **Deployment**: Docker, Vercel, Render

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Shops
- `GET /api/shops` - List shops
- `POST /api/shops` - Create shop
- `GET /api/shops/{id}` - Get shop
- `PUT /api/shops/{id}` - Update shop
- `DELETE /api/shops/{id}` - Delete shop

### Stock Movements
- `GET /api/movements` - List movements
- `POST /api/movements/opening` - Opening stock
- `POST /api/movements/receipt` - Stock receipt
- `POST /api/movements/distribution` - Stock distribution
- `POST /api/movements/correction` - Stock correction
- `POST /api/movements/spoil` - Spoiled stock

### Reports
- `GET /api/reports/summary` - Summary report
- `GET /api/reports/by-shop` - Shop report
- `GET /api/reports/by-product` - Product report
- `GET /api/reports/spoils` - Spoilage report

### Export
- `GET /api/export/movements` - Export movements
- `GET /api/export/products` - Export products

## 🔐 Authentication

The API uses Laravel Sanctum for token-based authentication:

```http
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

## 📈 Rate Limiting

- **Public routes**: 5-10 requests per minute
- **Authenticated routes**: 120 requests per minute

## 🚨 Error Handling

Standard HTTP status codes with JSON responses:

```json
{
    "message": "Error description",
    "errors": {
        "field": ["Error message"]
    }
}
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test
php artisan test --filter Feature/ProductTest
```

## 🚀 Deployment

### Vercel (Serverless)
- Zero configuration deployment
- Automatic scaling
- Global CDN

### Render
- Simple deployment
- Built-in databases
- SSL certificates

### Docker
- Containerized deployment
- Consistent environments
- Easy scaling

### Traditional Hosting
- Apache/Nginx compatible
- Custom configurations
- Full control

## 📞 Support

For questions, issues, or contributions:

1. Check the [API Documentation](./API.md)
2. Review the [Setup Guide](./SETUP.md)
3. Read the [Architecture Documentation](./ARCHITECTURE.md)
4. Submit an issue on GitHub
5. Contact the development team

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Last Updated**: January 2024
**Version**: 1.0.0
