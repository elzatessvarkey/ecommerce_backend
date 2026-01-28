import crypto from 'crypto';
import models from '../models/index.js';

export const getOrders = async (req, res) => {
  try {
    const orders = await models.Order.unscoped().findAll({
      order: [['orderTimeMs', 'DESC']]
    });

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
    // Get cart items from database instead of request body
    const cartItems = await models.CartItem.findAll();

    // Validate cart
    if (cartItems.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cart is empty'
      });
    }

    let totalCostCents = 0;
    const orderProducts = [];

    // Get all product IDs and delivery option IDs
    const productIds = cartItems.map(item => item.productId);
    const deliveryOptionIds = [...new Set(cartItems.map(item => item.deliveryOptionId))];

    // Fetch products and delivery options
    const [products, deliveryOptions] = await Promise.all([
      models.Product.findAll({ where: { id: productIds } }),
      models.DeliveryOption.findAll({ where: { id: deliveryOptionIds } })
    ]);

    // Create lookup maps
    const productMap = products.reduce((map, product) => {
      map[product.id] = product;
      return map;
    }, {});

    const deliveryOptionMap = deliveryOptions.reduce((map, option) => {
      map[option.id] = option;
      return map;
    }, {});

    // Validate each cart item and calculate costs
    for (const item of cartItems) {
      const product = productMap[item.productId];
      const deliveryOption = deliveryOptionMap[item.deliveryOptionId];

      if (!product) {
        return res.status(400).json({
          status: 'error',
          message: `Product ${item.productId} not found`
        });
      }

      if (!deliveryOption) {
        return res.status(400).json({
          status: 'error',
          message: `Delivery option ${item.deliveryOptionId} not found`
        });
      }

      // Calculate item cost: product price * quantity + shipping
      const itemCost = product.priceCents * item.quantity + deliveryOption.priceCents;
      totalCostCents += itemCost;

      // Calculate estimated delivery time
      const estimatedDeliveryTimeMs = Date.now() + (deliveryOption.deliveryDays * 24 * 60 * 60 * 1000);

      orderProducts.push({
        productId: item.productId,
        quantity: item.quantity,
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