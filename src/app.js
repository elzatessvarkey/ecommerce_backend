import express from 'express';
import apiRoutes from './routes/api.routes.js';
import errorHandler from './middlewares/error.middleware.js';
import sequelize from './config/database.js';
import models from './models/index.js';
import { defaultProducts } from '../defaultData/defaultProducts.js';
import { defaultDeliveryOptions } from '../defaultData/defaultDeliveryOptions.js';
import { defaultCartItems } from '../defaultData/defaultCartItems.js';
import { defaultOrders } from '../defaultData/defaultOrders.js';

const app = express();

// Database connection and sync
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    await sequelize.sync({ force: false }); // Set force: true to drop and recreate tables
    console.log('Database synchronized.');

    // Seed default products if none exist
    const productCount = await models.Product.count();
    if (productCount === 0) {
      await models.Product.bulkCreate(defaultProducts);
      console.log('Default products seeded successfully.');
    } else {
      console.log('Products already exist in database.');
    }

    // Seed default delivery options if none exist
    const deliveryOptionCount = await models.DeliveryOption.count();
    if (deliveryOptionCount === 0) {
      await models.DeliveryOption.bulkCreate(defaultDeliveryOptions);
      console.log('Default delivery options seeded successfully.');
    } else {
      console.log('Delivery options already exist in database.');
    }

    // Seed default cart items if none exist
    const cartItemCount = await models.CartItem.count();
    if (cartItemCount === 0) {
      await models.CartItem.bulkCreate(defaultCartItems);
      console.log('Default cart items seeded successfully.');
    } else {
      console.log('Cart items already exist in database.');
    }

    // Seed default orders if none exist
    const orderCount = await models.Order.count();
    if (orderCount === 0) {
      await models.Order.bulkCreate(defaultOrders);
      console.log('Default orders seeded successfully.');
    } else {
      console.log('Orders already exist in database.');
    }
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
})();

// Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static images
app.use('/images', express.static('images'));

// Routes
app.use(apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Middleware
app.use(errorHandler);

export default app;
