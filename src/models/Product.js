import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { create } from 'archiver';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rating: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  priceCents: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  keywords: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE(3),
  },
  updatedAt: {
    type: DataTypes.DATE(3),
  },
}, {
  timestamps: true,
  defaultScope: {
    order: [['createdAt', 'ASC']]
  }
});

export default Product;