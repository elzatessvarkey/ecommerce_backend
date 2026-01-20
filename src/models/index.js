import sequelize from '../config/database.js';

// Import models here as you create them
import Product from './Product.js';
import DeliveryOption from './DeliveryOption.js';

const models = {
  Product,
  DeliveryOption,
  sequelize,
};

export default models;