import express from 'express';
import apiRoutes from './routes/api.routes.js';
import errorHandler from './middlewares/error.middleware.js';
import sequelize from './config/database.js';
import models from './models/index.js';

const app = express();

// Database connection and sync
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    return sequelize.sync({ force: false }); // Set force: true to drop and recreate tables
  })
  .then(() => {
    console.log('Database synchronized.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

// Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Middleware
app.use(errorHandler);

export default app;
