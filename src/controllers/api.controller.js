import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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

export const putCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, deliveryOptionId } = req.body;

    // Find the cart item
    const cartItem = await models.CartItem.findOne({
      where: { productId }
    });

    if (!cartItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart item not found'
      });
    }

    // Validate quantity if provided
    if (quantity !== undefined) {
      const qty = parseInt(quantity);
      if (isNaN(qty) || qty < 1 || qty > 10) {
        return res.status(400).json({
          status: 'error',
          message: 'Quantity must be a number between 1 and 10'
        });
      }
      cartItem.quantity = qty;
    }

    // Validate deliveryOptionId if provided
    if (deliveryOptionId !== undefined) {
      const deliveryOption = await models.DeliveryOption.findByPk(deliveryOptionId);
      if (!deliveryOption) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid delivery option'
        });
      }
      cartItem.deliveryOptionId = deliveryOptionId;
    }

    // Save the updated cart item
    await cartItem.save();

    res.status(200).json({
      data: cartItem
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update cart item'
    });
  }
};

export const deleteCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find the cart item
    const cartItem = await models.CartItem.findOne({
      where: { productId }
    });

    if (!cartItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart item not found'
      });
    }

    // Delete the cart item
    await cartItem.destroy();

    res.status(204).send(); // No Content
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete cart item'
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await models.Order.findAll();
    
    if (req.query.expand === 'products') {
      // Collect all productIds from all orders
      const allProductIds = [];
      orders.forEach(order => {
        order.products.forEach(product => {
          if (!allProductIds.includes(product.productId)) {
            allProductIds.push(product.productId);
          }
        });
      });
      
      // Fetch all products
      const products = await models.Product.findAll({
        where: { id: allProductIds }
      });
      
      // Create product map
      const productMap = products.reduce((map, product) => {
        map[product.id] = product;
        return map;
      }, {});
      
      // Expand orders with product details
      const expandedOrders = orders.map(order => ({
        ...order.toJSON(),
        products: order.products.map(product => ({
          ...product,
          productDetails: productMap[product.productId]
        }))
      }));
      
      res.status(200).json({
        data: expandedOrders
      });
    } else {
      res.status(200).json({
        data: orders
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch orders'
    });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await models.Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }
    
    if (req.query.expand === 'products') {
      // Collect all productIds from the order
      const productIds = order.products.map(product => product.productId);
      
      // Fetch all products
      const products = await models.Product.findAll({
        where: { id: productIds }
      });
      
      // Create product map
      const productMap = products.reduce((map, product) => {
        map[product.id] = product;
        return map;
      }, {});
      
      // Expand order with product details
      const expandedOrder = {
        ...order.toJSON(),
        products: order.products.map(product => ({
          ...product,
          productDetails: productMap[product.productId]
        }))
      };
      
      res.status(200).json({
        data: expandedOrder
      });
    } else {
      res.status(200).json({
        data: order
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch order'
    });
  }
};

export const postOrder = async (req, res) => {
  try {
    const { cart } = req.body;

    // Validate cart
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cart is required and must be a non-empty array'
      });
    }

    let totalCostCents = 0;
    const orderProducts = [];

    // Validate each cart item and calculate costs
    for (const item of cart) {
      const { productId, quantity, deliveryOptionId } = item;

      if (!productId || !quantity || !deliveryOptionId) {
        return res.status(400).json({
          status: 'error',
          message: 'Each cart item must have productId, quantity, and deliveryOptionId'
        });
      }

      const qty = parseInt(quantity);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Quantity must be a positive number'
        });
      }

      // Check if product exists
      const product = await models.Product.findByPk(productId);
      if (!product) {
        return res.status(400).json({
          status: 'error',
          message: `Product ${productId} not found`
        });
      }

      // Check if delivery option exists
      const deliveryOption = await models.DeliveryOption.findByPk(deliveryOptionId);
      if (!deliveryOption) {
        return res.status(400).json({
          status: 'error',
          message: `Delivery option ${deliveryOptionId} not found`
        });
      }

      // Calculate item cost: product price * quantity + shipping
      const itemCost = product.priceCents * qty + deliveryOption.priceCents;
      totalCostCents += itemCost;

      // Calculate estimated delivery time
      const estimatedDeliveryTimeMs = Date.now() + (deliveryOption.deliveryDays * 24 * 60 * 60 * 1000);

      orderProducts.push({
        productId,
        quantity: qty,
        estimatedDeliveryTimeMs
      });
    }

    // Apply 10% tax
    totalCostCents = Math.round(totalCostCents * 1.1);

    // Generate unique order id
    const id = crypto.randomUUID();

    // Create order with generated id
    const order = await models.Order.create({
      id,
      orderTimeMs: Date.now(),
      totalCostCents,
      products: orderProducts
    });

    // Clear the cart after successful order creation
    await models.CartItem.destroy({ where: {} });

    res.status(201).json({
      data: order
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create order'
    });
  }
};
