import express from 'express';
import apiRoutes from './routes/api.routes.js';
import errorHandler from './middlewares/error.middleware.js';
import sequelize from './config/database.js';
import models from './models/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Database connection and sync
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    await sequelize.sync({ force: false }); // Set force: true to drop and recreate tables
    console.log('Database synchronized.');
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
