import crypto from 'crypto';
import models from '../models/index.js';

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