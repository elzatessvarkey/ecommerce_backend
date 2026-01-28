# E-Commerce Backend API

A RESTful API backend for an e-commerce platform built with Node.js, Express, and supports both SQLite and AWS RDS MySQL databases.

## Features

### Product Search
- **Query Parameter Search**: Search products using `?search=` query parameter
- **Fuzzy Search**: Intelligent search with typo tolerance (up to 40% mismatch allowed)
- **Keyword Matching**: Searches both product names and keyword arrays
- **Examples**:
  - `?search=bluetooth` - finds products with "bluetooth" in name or keywords
  - `?search=speeker` - fuzzy match finds "speaker" products despite typo
  - `?search=apparel` - finds all clothing items with "apparel" keyword

### Frontend Integration
- **SPA Support**: Serves frontend from `dist` folder with catch-all routing
- **Single Page Application**: Any unmatched route returns `index.html` for client-side routing
- **Static File Serving**: All assets (CSS, JS, images) served from dist folder
- **Automatic fallback**: Missing frontend build returns helpful error message

### Database Management
- **Dual Database Support**: Automatically switches between SQLite (local) and MySQL (AWS RDS)
- **AWS Elastic Beanstalk Integration**: Detects RDS environment variables and connects automatically
- **PostgreSQL Support**: Also compatible with PostgreSQL databases
- **Default Ordering**: All models automatically sort by `createdAt` ascending
- **Millisecond Precision Timestamps**: DATE(3) type for accurate ordering
- **Unique Timestamps on Bulk Insert**: Each seeded record gets unique timestamp based on array index
- **Automatic Synchronization**: Database schema syncs on startup
- **Connection Pooling**: Production-ready connection management
- Database reset and seeding endpoint with proper timestamp handling
- Persistent data storage

### Product Catalog
- 43 products across multiple categories (including new Bluetooth Speaker)
- Kitchen appliances, apparel, electronics, home goods, and more
- Product ratings and reviews
- Price information in cents
- Keyword tagging for easy categorization

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Databases**: SQLite3 (local), MySQL (AWS RDS), and PostgreSQL with Sequelize ORM
- **Search**: Fuse.js for fuzzy searching
- **Compression**: Archiver for project backups
- **Frontend**: Serves static SPA from dist folder
- **Development**: Nodemon for hot reloading
- **Code Quality**: ESLint

## Installation

### Local Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ecommerce_backend_mine
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (for local SQLite):
```env
PORT=5000
NODE_ENV=development
DB_PATH=./database.sqlite
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### AWS Elastic Beanstalk Setup

1. Deploy to Elastic Beanstalk:
```bash
eb init
eb create ecommerce-env
```

2. Configure RDS environment variables in Elastic Beanstalk:

In your Elastic Beanstalk environment, set the following environment variables:

```
RDS_HOSTNAME=your-rds-endpoint.rds.amazonaws.com
RDS_PORT=3306
RDS_DB_NAME=your_database_name
RDS_USERNAME=your_database_user
RDS_PASSWORD=your_secure_password
NODE_ENV=production
PORT=5000
```

3. The application will automatically detect the RDS environment variables and connect to MySQL instead of SQLite.

### Database Configuration

The application automatically selects the database based on available environment variables:

**Automatic Detection Logic**:
```
If RDS_HOSTNAME, RDS_PORT, and RDS_DB_NAME exist:
  → Use AWS RDS MySQL
Else:
  → Use SQLite (local)
```

**Local Development** (SQLite):
- No configuration needed, uses `./database.sqlite` by default
- Ideal for rapid development and testing

**Production** (AWS RDS MySQL):
- Requires AWS RDS instance with MySQL
- Environment variables automatically provided by Elastic Beanstalk
- Includes connection pooling (5 max connections)
- 60-second connection timeout for reliability

## API Endpoints

### Products

#### Get All Products
```http
GET /api/products
```

**Response**:
```json
{
  "data": [
    {
      "id": "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
      "image": "images/products/athletic-cotton-socks-6-pairs.jpg",
      "name": "Black and Gray Athletic Cotton Socks - 6 Pairs",
      "rating": {
        "stars": 4.5,
        "count": 87
      },
      "priceCents": 1090,
      "keywords": ["socks", "sports", "apparel"]
    }
  ]
}
```

#### Search Products
```http
GET /api/products?search=bluetooth
```

**Query Parameters**:
- `search` (string): Search term for fuzzy matching against product names and keywords

**Response**: Same as Get All Products, but filtered by search term

**Examples**:
```bash
# Exact match
curl "http://localhost:5000/api/products?search=speaker"

# Fuzzy match (typo tolerance)
curl "http://localhost:5000/api/products?search=speeker"

# Keyword search
curl "http://localhost:5000/api/products?search=kitchen"
```

### Delivery Options

#### Get All Delivery Options
```http
GET /api/delivery-options
```

### Cart

#### Get Cart Items
```http
GET /api/cart-items
```

#### Add Item to Cart
```http
POST /api/cart-items
```

#### Update Cart Item
```http
PUT /api/cart-items/:productId
```

#### Remove Cart Item
```http
DELETE /api/cart-items/:productId
```

### Payment

#### Get Payment Summary
```http
GET /api/payment-summary
```

### Orders

#### Get All Orders
```http
GET /api/orders
```

#### Get Single Order
```http
GET /api/orders/:orderId
```

#### Create Order
```http
POST /api/orders
```

### Utility

#### Reset Database
```http
POST /api/reset
```

Drops all tables, recreates them, and seeds with default data from `defaultData/` folder with unique timestamps for proper ordering.

**Response**:
```json
{
  "status": "success",
  "message": "Database reset and seeded successfully"
}
```

### Frontend Routes

Any unmatched GET route will serve `dist/index.html` for single-page application (SPA) support.

**Example Routes**:
```http
GET /          # Serves index.html
GET /products  # Serves index.html (SPA routing)
GET /checkout  # Serves index.html (SPA routing)
GET /cart      # Serves index.html (SPA routing)
```

## Project Structure

```
ecommerce_backend_mine/
├── backend/              # JSON data files
│   ├── products.json
│   ├── cart.json
│   ├── orders.json
│   └── deliveryOptions.json
├── defaultData/          # Default seed data
│   ├── defaultProducts.js
│   ├── defaultCartItems.js
│   ├── defaultOrders.js
│   └── defaultDeliveryOptions.js
├── images/               # Product images
│   ├── products/
│   ├── icons/
│   └── ratings/
├── src/
│   ├── app.js           # Express app setup
│   ├── config/          # Configuration files
│   │   ├── database.js
│   │   └── env.js
│   ├── controllers/     # Route controllers
│   │   ├── product.controller.js
│   │   ├── cart.controller.js
│   │   ├── order.controller.js
│   │   ├── payment.controller.js
│   │   ├── delivery.controller.js
│   │   └── utility.controller.js
│   ├── models/          # Sequelize models
│   │   ├── Product.js
│   │   ├── CartItem.js
│   │   ├── Order.js
│   │   ├── DeliveryOption.js
│   │   └── index.js
│   ├── routes/          # API routes
│   │   └── api.routes.js
│   └── middlewares/     # Custom middlewares
│       └── error.middleware.js
├── server.js            # Entry point
├── package.json
└── eslint.config.js
```

## Data Models

All models include:
- `createdAt` - Timestamp with millisecond precision (DATE(3))
- `updatedAt` - Timestamp with millisecond precision (DATE(3))
- **Default Ordering**: Results automatically sorted by `createdAt` ascending

### Product
```javascript
{
  id: String (UUID),
  image: String,
  name: String,
  rating: {
    stars: Number,
    count: Number
  },
  priceCents: Integer,
  keywords: Array<String>,
  createdAt: Date (with millisecond precision),
  updatedAt: Date (with millisecond precision)
}
```

### CartItem
```javascript
{
  productId: String,
  quantity: Integer,
  deliveryOptionId: String,
  createdAt: Date (with millisecond precision),
  updatedAt: Date (with millisecond precision)
}
```

### Order
```javascript
{
  id: String (UUID),
  orderTimeMs: BigInt,
  totalCostCents: Integer,
  products: Array,
  createdAt: Date (with millisecond precision),
  updatedAt: Date (with millisecond precision)
}
```

### DeliveryOption
```javascript
{
  id: String,
  deliveryDays: Integer,
  priceCents: Integer,
  createdAt: Date (with millisecond precision),
  updatedAt: Date (with millisecond precision)
}
```

## Ordering & Sorting

All models use **Sequelize default scopes** to automatically sort by `createdAt` in ascending order:

```javascript
defaultScope: {
  order: [['createdAt', 'ASC']]
}
```

This means:
- Every `findAll()` query returns results sorted by creation time
- No need to specify `order` in individual queries
- Consistent ordering across all endpoints
- Can be overridden per-query if needed

## Timestamp Precision

All timestamp fields use `DATE(3)` type for millisecond precision:
- `createdAt` - Records creation time
- `updatedAt` - Records last modification time
- Database seed automatically adds unique timestamps based on array index for proper ordering

## Search Implementation

The fuzzy search feature uses the **Fuse.js** library with the following configuration:

```javascript
{
  keys: ['name', 'keywords'],     // Search in both name and keywords
  threshold: 0.4,                 // 40% mismatch tolerance
  minMatchCharLength: 1,          // Minimum character match
  includeScore: false             // Don't include match scores
}
```

This allows users to find products even with:
- Typos and misspellings
- Partial matches
- Keyword variations

## Development

### Run Development Server
```bash
npm run dev
```

### Lint Code
```bash
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Reset Database
```bash
curl -X POST http://localhost:5000/api/reset
```

### Create Project Backup

Create an automated backup of your project files as a ZIP archive:

```bash
npm run zip
```

**Features**:
- Automatically excludes `node_modules`, `database.sqlite`, and previous ZIP files
- Includes hidden files (dotfiles)
- Uses archiver with glob patterns for efficient file selection
- Automatically increments backup ID (ecommerce_backend_1.zip, ecommerce_backend_2.zip, etc.)
- Maximum compression (level 9)
- Shows file count and archive size

**ZIP Files Created**: `ecommerce_backend_1.zip`, `ecommerce_backend_2.zip`, etc.

## Environment Variables

| Variable | Description | Default | AWS RDS |
|----------|-------------|---------|---------|
| `PORT` | Server port | 5000 | Optional |
| `NODE_ENV` | Environment | development | Recommended: production |
| `DB_PATH` | SQLite database path | ./database.sqlite | N/A |
| `RDS_HOSTNAME` | AWS RDS host | N/A | Required |
| `RDS_PORT` | AWS RDS port | N/A | Required (usually 3306) |
| `RDS_DB_NAME` | AWS RDS database name | N/A | Required |
| `RDS_USERNAME` | AWS RDS username | N/A | Required |
| `RDS_PASSWORD` | AWS RDS password | N/A | Required |

## Dependencies

### Production
- `express` - Web framework
- `sequelize` - ORM for both SQLite and MySQL
- `sqlite3` - SQLite database driver
- `mysql2` - MySQL database driver (for AWS RDS)
- `dotenv` - Environment configuration
- `fuse.js` - Fuzzy search library

### Development
- `nodemon` - Auto-restart on changes
- `eslint` - Code linting
- `archiver` - ZIP file creation

## API Response Format

### Success Response
```json
{
  "data": [...]
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Sample Products

The database includes 43 products across categories:
- **Electronics**: Bluetooth speakers, espresso makers, blenders
- **Apparel**: T-shirts, sweaters, pants, shoes
- **Kitchen**: Cookware, plates, towels, containers
- **Home**: Curtains, towels, mirrors, bedding
- **Accessories**: Sunglasses, jewelry, hats

## License

ISC

---

**Base URL**: `http://localhost:5000`

**API Prefix**: `/api`

**Environment**: Supports local development (SQLite) and production (AWS RDS MySQL)
