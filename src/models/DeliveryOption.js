import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DeliveryOption = sequelize.define('DeliveryOption', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  deliveryDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  priceCents: {
    type: DataTypes.INTEGER,
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

export default DeliveryOption;