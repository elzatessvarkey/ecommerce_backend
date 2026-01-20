import sequelize from '../config/database.js';

// Import models here as you create them
import Product from './Product.js';
import DeliveryOption from './DeliveryOption.js';
import CartItem from './CartItem.js';

const models = {
  Product,
  DeliveryOption,
  CartItem,
  sequelize,
};

export default models;