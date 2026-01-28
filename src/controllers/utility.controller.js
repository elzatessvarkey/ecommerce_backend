import sequelize from '../config/database.js';
import models from '../models/index.js';
import { defaultProducts } from '../../defaultData/defaultProducts.js';
import { defaultDeliveryOptions } from '../../defaultData/defaultDeliveryOptions.js';
import { defaultCartItems } from '../../defaultData/defaultCartItems.js';
import { defaultOrders } from '../../defaultData/defaultOrders.js';

// Helper function to add unique timestamps to seeded data
const addTimestamps = (data) => {
  const now = Date.now();
  return data.map((item, index) => ({
    ...item,
    createdAt: new Date(now + index),
    updatedAt: new Date(now + index)
  }));
};

export const resetDatabase = async (req, res) => {
  try {
    // Drop all tables and recreate them
    await sequelize.sync({ force: true });
    console.log('Database schema reset successfully.');

    // Seed default data with unique timestamps
    await models.Product.bulkCreate(addTimestamps(defaultProducts));
    await models.DeliveryOption.bulkCreate(addTimestamps(defaultDeliveryOptions));
    await models.CartItem.bulkCreate(addTimestamps(defaultCartItems));
    await models.Order.bulkCreate(addTimestamps(defaultOrders));
    console.log('Default data seeded successfully.');

    res.status(200).json({
      status: 'success',
      message: 'Database reset and seeded successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset database'
    });
  }
};