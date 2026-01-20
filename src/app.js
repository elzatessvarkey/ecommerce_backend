import express from 'express';
import apiRoutes from './routes/api.routes.js';
import errorHandler from './middlewares/error.middleware.js';
import sequelize from './config/database.js';
import models from './models/index.js';
import { defaultProducts } from '../defaultData/defaultProducts.js';

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
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
})();

// Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Middleware
app.use(errorHandler);

export default app;
