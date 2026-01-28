# E-Commerce Backend API

A RESTful API backend for an e-commerce platform built with Node.js, Express, and SQLite.

## Features

### Product Search
- **Query Parameter Search**: Search products using `?search=` query parameter
- **Fuzzy Search**: Intelligent search with typo tolerance (up to 40% mismatch allowed)
- **Keyword Matching**: Searches both product names and keyword arrays
- **Examples**:
  - `?search=bluetooth` - finds products with "bluetooth" in name or keywords
  - `?search=speeker` - fuzzy match finds "speaker" products despite typo
  - `?search=apparel` - finds all clothing items with "apparel" keyword

### Database Management
- SQLite database with Sequelize ORM
- Database reset and seeding endpoint
- Automatic synchronization on startup
- Persistent data storage

### Product Catalog
- 43 products across multiple categories
- Kitchen appliances, apparel, electronics, home goods, and more
- Product ratings and reviews
- Price information in cents
- Keyword tagging for easy categorization

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: SQLite3 with Sequelize ORM
- **Search**: Fuse.js for fuzzy searching
- **Development**: Nodemon for hot reloading
- **Code Quality**: ESLint

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ecommerce_backend_mine
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

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

Drops all tables, recreates them, and seeds with default data from `defaultData/` folder.

**Response**:
```json
{
  "status": "success",
  "message": "Database reset and seeded successfully"
}
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
  keywords: Array<String>
}
```

### CartItem
```javascript
{
  productId: String,
  quantity: Integer
}
```

### Order
```javascript
{
  id: String (UUID),
  orderTime: String,
  totalCostCents: Integer,
  products: Array
}
```

### DeliveryOption
```javascript
{
  id: String,
  deliveryDays: Integer,
  priceCents: Integer
}
```

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

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |

## Dependencies

### Production
- `express` - Web framework
- `sequelize` - ORM for SQLite
- `sqlite3` - Database driver
- `dotenv` - Environment configuration
- `fuse.js` - Fuzzy search library

### Development
- `nodemon` - Auto-restart on changes
- `eslint` - Code linting

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

## Author

Elza Tess Varkey

---

**Base URL**: `http://localhost:5000`

**API Prefix**: `/api`
