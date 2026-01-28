import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CartItem = sequelize.define('CartItem', {
  productId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  deliveryOptionId: {
    type: DataTypes.STRING,
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

export default CartItem;