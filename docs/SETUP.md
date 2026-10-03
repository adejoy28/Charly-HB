# Stock Meuve Backend Setup Guide

## Prerequisites

- PHP 8.2 or higher
- Composer
- MySQL or PostgreSQL database
- Node.js and npm (for frontend assets)
- Git

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd stock-meuve
```

### 2. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### 3. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Database Setup

Edit your `.env` file with your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=stock_meuve
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Run the migrations:

```bash
php artisan migrate
```

### 5. Seed the Database (Optional)

```bash
php artisan db:seed
```

## Development

### Starting the Development Server

```bash
# Start Laravel development server
php artisan serve

# Start queue worker (in another terminal)
php artisan queue:work

# Start frontend development (in another terminal)
npm run dev
```

Or use the convenience script:

```bash
composer run dev
```

### Running Tests

```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test
php artisan test --filter Feature/ProductTest
```

### Code Style

```bash
# Fix code style
composer run lint

# Check code style
./vendor/bin/pint --test
```

## API Documentation

Once the server is running, you can access the interactive API documentation at:

```
http://localhost:8000/docs
```

This is powered by Scramble and provides auto-generated OpenAPI documentation.

## Production Deployment

### Environment Variables

Make sure to set these production variables in your `.env`:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=your-db-name
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password

# Cache and session drivers
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Mail configuration
MAIL_MAILER=smtp
MAIL_HOST=your-mail-host
MAIL_PORT=587
MAIL_USERNAME=your-mail-username
MAIL_PASSWORD=your-mail-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"
```

### Optimization Commands

```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer install --optimize-autoloader --no-dev
```

### Deployment Options

#### Vercel (Serverless)

The project is configured for Vercel deployment. Simply:

1. Connect your repository to Vercel
2. Set environment variables
3. Deploy

#### Render

1. Connect your repository to Render
2. Choose "Web Service"
3. Set build command: `composer install --optimize-autoloader --no-dev`
4. Set start command: `php artisan serve --host=0.0.0.0 --port=${PORT:-8000}`

#### Docker

```bash
# Build image
docker build -t stock-meuve .

# Run container
docker run -p 8000:8000 stock-meuve
```

#### Traditional Hosting

1. Upload files to server
2. Set up web server (Apache/Nginx)
3. Configure document root to `public/`
4. Set up SSL certificate
5. Run optimization commands

## Security

### Sanctum Tokens

The API uses Laravel Sanctum for authentication. Make sure to:

1. Configure your allowed origins in `config/cors.php`
2. Set proper token expiration in `config/sanctum.php`
3. Use HTTPS in production

### Rate Limiting

Rate limiting is configured in `routes/api.php`. Adjust as needed for your use case.

### Database Security

- Use strong database passwords
- Limit database user permissions
- Enable SSL for database connections
- Regularly update dependencies

## Monitoring

### Logging

Logs are stored in `storage/logs/laravel.log`. Monitor for:

- Authentication failures
- API errors
- Performance issues

### Health Checks

The application includes health check endpoints:

```
GET /health
GET /health/database
GET /health/cache
```

## Troubleshooting

### Common Issues

1. **500 Internal Server Error**
   - Check `.env` configuration
   - Verify database connection
   - Check file permissions

2. **Authentication Issues**
   - Verify Sanctum configuration
   - Check CORS settings
   - Ensure HTTPS is used in production

3. **Database Issues**
   - Run migrations: `php artisan migrate`
   - Check database credentials
   - Verify database server is running

### Debug Mode

Enable debug mode only in development:

```env
APP_DEBUG=true
```

Never enable debug mode in production.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.
