import sequelize from '../config/database.js';

// Import models here as you create them
import User from './User.js';

const models = {
  User,
  sequelize,
};

export default models;