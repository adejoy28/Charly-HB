# Stock Meuve

A modern Laravel-based inventory management system for multi-shop stock tracking and reporting.

## 🚀 Features

- **Multi-shop Support**: Manage inventory across multiple locations
- **Real-time Tracking**: Monitor stock movements in real-time
- **Comprehensive API**: RESTful API with OpenAPI documentation
- **Movement Types**: Opening stock, receipts, distributions, corrections, and spoilage tracking
- **Advanced Reporting**: Detailed analytics and export capabilities
- **Modern Architecture**: Clean, scalable codebase with Laravel 12

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[API Documentation](./docs/API.md)** - Complete REST API reference
- **[Setup Guide](./docs/SETUP.md)** - Installation and configuration
- **[Architecture Documentation](./docs/ARCHITECTURE.md)** - System design and technical details
- **[Documentation Index](./docs/README.md)** - Complete documentation overview

## 🛠️ Technology Stack

- **Backend**: Laravel 12, PHP 8.2+
- **Database**: MySQL/PostgreSQL
- **Authentication**: Laravel Sanctum
- **API Documentation**: Scramble (OpenAPI)
- **Queue System**: Redis/Database
- **Testing**: PHPUnit

## 🚀 Quick Start

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd stock-meuve
   composer install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   php artisan db:seed
   ```

3. **Start development server**
   ```bash
   php artisan serve
   ```

4. **Access API documentation**
   ```
   http://localhost:8000/docs
   ```

## 📊 API Overview

### Authentication
- Token-based authentication using Laravel Sanctum
- Rate limiting for security
- User registration and management

### Core Resources
- **Products**: Manage product catalog
- **Shop**: Multi-location management
- **Movements**: Track all stock movements
- **Reports**: Analytics and insights
- **Export**: Data export functionality

### Movement Types
- Opening Stock (initial inventory)
- Receipts (stock from suppliers)
- Distributions (between shops)
- Corrections (manual adjustments)
- Spoilage (damaged/expired items)

## 🧪 Testing

```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage
```

## 🚀 Deployment

The application is configured for multiple deployment options:

- **Vercel** (serverless)
- **Render** (PaaS)
- **Docker** (containerized)
- **Traditional hosting** (Apache/Nginx)

## 📖 Documentation

For detailed information about the API, setup, and architecture, please refer to the [documentation directory](./docs).

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using [Laravel](https://laravel.com)
