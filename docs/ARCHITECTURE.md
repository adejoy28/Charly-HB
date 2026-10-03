# Stock Meuve Architecture Documentation

## System Overview

Stock Meuve is a multi-shop inventory management system built with Laravel 12. The system tracks stock movements across multiple shops, providing real-time inventory visibility and reporting capabilities.

## Architecture Pattern

The application follows a **Layered Architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│              Frontend (SPA)             │
├─────────────────────────────────────────┤
│              API Gateway                │
├─────────────────────────────────────────┤
│         Controllers (HTTP Layer)        │
├─────────────────────────────────────────┤
│         Services (Business Logic)       │
├─────────────────────────────────────────┤
│          Models (Data Layer)            │
├─────────────────────────────────────────┤
│         Database (MySQL/PostgreSQL)     │
└─────────────────────────────────────────┘
```

## Core Components

### 1. Authentication & Authorization

- **Laravel Sanctum**: API token-based authentication
- **Middleware**: Request throttling and authentication
- **Policies**: Resource-based authorization

### 2. Stock Management

#### Movement Types
- **Opening Stock**: Initial inventory setup
- **Receipt**: Stock incoming from suppliers
- **Distribution**: Stock transfer between shops
- **Correction**: Manual inventory adjustments
- **Spoilage**: Damaged or expired items

#### Idempotency
All movement creation endpoints support idempotency to prevent duplicate operations.

### 3. Data Models

#### Core Entities

**Product**
```php
- id: Primary Key
- name: string
- description: text
- sku: string (unique)
- price: decimal
- timestamps
```

**Shop**
```php
- id: Primary Key
- name: string
- address: text
- phone: string
- timestamps
```

**Movement**
```php
- id: Primary Key
- type: enum (opening, receipt, distribution, correction, spoil)
- shop_id: Foreign Key
- product_id: Foreign Key
- quantity: integer
- notes: text
- metadata: json (additional data)
- timestamps
```

**Movement Details** (for complex movements)
```php
- id: Primary Key
- movement_id: Foreign Key
- from_shop_id: Foreign Key (for distributions)
- to_shop_id: Foreign Key (for distributions)
- reason: string
- confirmed_at: timestamp
- confirmed_by: Foreign Key
```

### 4. API Design

#### RESTful Principles
- Resource-based URLs
- HTTP verb semantics
- Consistent response formats
- Proper HTTP status codes

#### Response Format
```json
{
    "data": [...],
    "links": {
        "first": "...",
        "last": "...",
        "prev": "...",
        "next": "..."
    },
    "meta": {
        "current_page": 1,
        "per_page": 15,
        "total": 100
    }
}
```

### 5. Business Logic Services

#### MovementService
Handles all stock movement operations:
- Validation of stock availability
- Quantity calculations
- Movement recording
- Audit trail maintenance

#### ReportService
Generates various reports:
- Summary reports
- Shop-wise reports
- Product-wise reports
- Spoilage analysis

#### ExportService
Handles data export functionality:
- CSV generation
- Excel export
- Filtering and formatting

### 6. Database Design

#### Relationships
```
Product ────< Movement >───── Shop
    │                           │
    └─────── ProductStock ──────┘
```

#### Indexes
- `movements.shop_id`
- `movements.product_id`
- `movements.type`
- `movements.created_at`
- `products.sku` (unique)

#### Constraints
- Foreign key constraints
- Check constraints for quantities
- Unique constraints for SKUs

### 7. Caching Strategy

#### Cache Layers
1. **Application Cache**: Frequently accessed data
   - Product lists
   - Shop lists
   - User permissions

2. **Query Cache**: Complex report queries
   - Daily summaries
   - Monthly reports

#### Cache Keys
```
products:list
shops:list
movements:shop:{id}:date:{date}
reports:summary:{date}
```

### 8. Queue System

#### Background Jobs
- **Report Generation**: Heavy report calculations
- **Export Jobs**: Large data exports
- **Notifications**: Email and SMS alerts
- **Data Cleanup**: Archive old movements

#### Queue Configuration
```php
'connections' => [
    'database' => [
        'driver' => 'database',
        'table' => 'jobs',
        'queue' => 'default',
        'retry_after' => 90,
    ],
],
```

### 9. Security Architecture

#### Authentication Flow
```
1. User Login → Validate Credentials
2. Generate Sanctum Token
3. Return Token to Client
4. Client includes token in API calls
5. Middleware validates token
6. Process request
```

#### Security Measures
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize all inputs
- **SQL Injection Prevention**: Use Eloquent ORM
- **XSS Protection**: Escape output
- **HTTPS Enforcement**: SSL/TLS only in production

### 10. Error Handling

#### Exception Hierarchy
```
Exception
├── AuthenticationException
├── AuthorizationException
├── ValidationException
├── ModelNotFoundException
├── HttpException
└── Custom Business Exceptions
    ├── InsufficientStockException
    ├── InvalidMovementException
    └── ShopNotFoundException
```

#### Error Response Format
```json
{
    "error": {
        "code": "INSUFFICIENT_STOCK",
        "message": "Not enough stock available",
        "details": {
            "requested": 100,
            "available": 50
        }
    }
}
```

### 11. Performance Optimization

#### Database Optimization
- **Query Optimization**: Use eager loading
- **Indexing**: Strategic index placement
- **Connection Pooling**: Efficient database connections

#### Application Optimization
- **Response Compression**: GZIP enabled
- **Image Optimization**: WebP format
- **CDN Integration**: Static asset delivery

#### Caching Strategy
- **Redis**: Session and cache storage
- **OPcache**: PHP bytecode cache
- **Browser Caching**: Proper cache headers

### 12. Monitoring & Logging

#### Application Monitoring
- **Performance Metrics**: Response times
- **Error Tracking**: Exception logging
- **Usage Analytics**: API usage patterns

#### Log Channels
```php
'channels' => [
    'stack' => [...],
    'single' => [...],
    'daily' => [...],
    'slack' => [...],
    'papertrail' => [...],
],
```

### 13. Deployment Architecture

#### Scalability Considerations
- **Horizontal Scaling**: Load balancer ready
- **Database Scaling**: Read replicas support
- **Cache Scaling**: Redis cluster support

#### Environment Configuration
- **Development**: Local setup with SQLite
- **Testing**: In-memory database
- **Staging**: Production-like environment
- **Production**: Optimized configuration

### 14. Integration Points

#### External Services
- **Email Service**: SMTP/SendGrid integration
- **SMS Service**: Twilio integration
- **File Storage**: AWS S3/Local storage
- **Analytics**: Custom tracking

#### API Versioning
```
/api/v1/...
/api/v2/...
```

### 15. Testing Strategy

#### Test Types
- **Unit Tests**: Model and Service logic
- **Feature Tests**: API endpoint testing
- **Integration Tests**: Full workflow testing
- **Performance Tests**: Load testing

#### Test Coverage
- Models: 100%
- Controllers: 95%
- Services: 90%
- Overall: 85%

## Future Enhancements

### Planned Features
1. **Real-time Updates**: WebSocket integration
2. **Advanced Analytics**: Business intelligence
3. **Mobile App**: React Native application
4. **Multi-tenancy**: Organization-based isolation
5. **Advanced Reporting**: Custom report builder

### Technical Improvements
1. **Microservices**: Service decomposition
2. **Event Sourcing**: Audit trail enhancement
3. **GraphQL**: Alternative API interface
4. **Elasticsearch**: Advanced search capabilities
5. **Kubernetes**: Container orchestration

## Best Practices

### Code Quality
- **PSR Standards**: Follow PHP standards
- **Design Patterns**: SOLID principles
- **Documentation**: Comprehensive code comments
- **Testing**: TDD approach

### Security
- **Regular Updates**: Keep dependencies current
- **Security Audits**: Regular security reviews
- **Environment Variables**: Secure configuration
- **Access Control**: Principle of least privilege

### Performance
- **Lazy Loading**: Optimize database queries
- **Caching**: Strategic cache implementation
- **Monitoring**: Performance metrics tracking
- **Optimization**: Regular performance reviews
