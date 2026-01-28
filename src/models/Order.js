import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  orderTimeMs: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  totalCostCents: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  products: {
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

export default Order;