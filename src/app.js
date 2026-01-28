import express from 'express';
import apiRoutes from './routes/api.routes.js';
import errorHandler from './middlewares/error.middleware.js';
import sequelize from './config/database.js';
import models from './models/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { defaultProducts } from '../defaultData/defaultProducts.js';
import { defaultDeliveryOptions } from '../defaultData/defaultDeliveryOptions.js';
import { defaultCartItems } from '../defaultData/defaultCartItems.js';
import { defaultOrders } from '../defaultData/defaultOrders.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Helper function to add unique timestamps to seeded data
const addTimestamps = (data) => {
  const now = Date.now();
  return data.map((item, index) => ({
    ...item,
    createdAt: new Date(now + index),
    updatedAt: new Date(now + index)
  }));
};

// Function to seed default data if database is empty
const seedDefaultData = async () => {
  try {
    // Check if data already exists
    const productCount = await models.Product.count();
    const deliveryOptionCount = await models.DeliveryOption.count();
    
    if (productCount === 0 && deliveryOptionCount === 0) {
      console.log('Database is empty. Seeding default data...');
      
      // Seed default data with unique timestamps
      await models.Product.bulkCreate(addTimestamps(defaultProducts));
      console.log('✓ Products seeded successfully.');
      
      await models.DeliveryOption.bulkCreate(addTimestamps(defaultDeliveryOptions));
      console.log('✓ Delivery options seeded successfully.');
      
      await models.CartItem.bulkCreate(addTimestamps(defaultCartItems));
      console.log('✓ Cart items seeded successfully.');
      
      await models.Order.bulkCreate(addTimestamps(defaultOrders));
      console.log('✓ Orders seeded successfully.');
      
      console.log('🌱 All default data seeded successfully.');
    } else {
      console.log('Database already contains data. Skipping seeding.');
    }
  } catch (error) {
    console.error('Error seeding default data:', error);
  }
};

// Database connection and sync
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    await sequelize.sync({ force: false }); // Set force: true to drop and recreate tables
    console.log('Database synchronized.');
    
    // Seed default data if database is empty
    await seedDefaultData();
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
app.use('/api', apiRoutes);

// Serve static files from dist folder
app.use(express.static('dist'));

// Catch-all route: Send index.html for any unmatched routes (SPA support)
// This should be after all other routes and static files
app.use((req, res) => {
  const indexPath = path.join(__dirname, '../dist/index.html');
  
  // Check if index.html exists
  if (!fs.existsSync(indexPath)) {
    console.warn(`⚠️  Warning: dist/index.html not found at ${indexPath}`);
    return res.status(404).json({ 
      message: 'Frontend build not found. Please run the build command for the frontend.',
      path: indexPath
    });
  }
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
});

// Error Middleware
app.use(errorHandler);

export default app;
