import sequelize from '../config/database.js';
import models from '../models/index.js';
import { defaultProducts } from '../../defaultData/defaultProducts.js';
import { defaultDeliveryOptions } from '../../defaultData/defaultDeliveryOptions.js';
import { defaultCartItems } from '../../defaultData/defaultCartItems.js';
import { defaultOrders } from '../../defaultData/defaultOrders.js';

export const resetDatabase = async (req, res) => {
  try {
    // Drop all tables and recreate them
    await sequelize.sync({ force: true });
    console.log('Database schema reset successfully.');

    // Seed default data
    await models.Product.bulkCreate(defaultProducts);
    await models.DeliveryOption.bulkCreate(defaultDeliveryOptions);
    await models.CartItem.bulkCreate(defaultCartItems);
    await models.Order.bulkCreate(defaultOrders);
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