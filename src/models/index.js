import sequelize from '../config/database.js';

// Import models here as you create them
import User from './User.js';
import Product from './Product.js';

const models = {
  User,
  Product,
  sequelize,
};

export default models;