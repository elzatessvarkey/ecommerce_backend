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

export const postCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate input
    if (!productId || !quantity) {
      return res.status(400).json({
        status: 'error',
        message: 'productId and quantity are required'
      });
    }

    // Check if quantity is a valid number between 1 and 10
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1 || qty > 10) {
      return res.status(400).json({
        status: 'error',
        message: 'Quantity must be a number between 1 and 10'
      });
    }

    // Check if product exists
    const product = await models.Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Check if product already in cart
    const existingCartItem = await models.CartItem.findOne({
      where: { productId }
    });

    if (existingCartItem) {
      // Increase quantity
      existingCartItem.quantity += qty;
      await existingCartItem.save();
    } else {
      // Add new cart item
      await models.CartItem.create({
        productId,
        quantity: qty,
        deliveryOptionId: "1"
      });
    }

    // Return the product
    res.status(201).json({
      data: product
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to add item to cart'
    });
  }
};
