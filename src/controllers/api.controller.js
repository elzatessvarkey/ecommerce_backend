import fs from 'fs';
import path from 'path';
import models from '../models/index.js';

export const getProducts = (req, res) => {
  try {
    const productsPath = path.join(process.cwd(), 'backend', 'products.json');
    const productsData = fs.readFileSync(productsPath, 'utf8');
    const products = JSON.parse(productsData);
    res.status(200).json({
      data: products
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch products'
    });
  }
};

export const getDeliveryOptions = async (req, res) => {
  try {
    const deliveryOptions = await models.DeliveryOption.findAll();
    res.status(200).json({
      data: deliveryOptions
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch delivery options'
    });
  }
};

export const getCartItems = async (req, res) => {
  try {
    const cartItems = await models.CartItem.findAll();
    
    if (req.query.expand === 'product') {
      const productIds = cartItems.map(item => item.productId);
      const products = await models.Product.findAll({
        where: { id: productIds }
      });
      
      const productMap = products.reduce((map, product) => {
        map[product.id] = product;
        return map;
      }, {});
      
      const expandedCartItems = cartItems.map(item => ({
        ...item.toJSON(),
        product: productMap[item.productId]
      }));
      
      res.status(200).json({
        data: expandedCartItems
      });
    } else {
      res.status(200).json({
        data: cartItems
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch cart items'
    });
  }
};
