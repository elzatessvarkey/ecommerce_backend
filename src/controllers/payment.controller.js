import models from '../models/index.js';

export const getPaymentSummary = async (req, res) => {
  try {
    // Get all cart items
    const cartItems = await models.CartItem.findAll();

    if (cartItems.length === 0) {
      return res.status(200).json({
        data: {
          totalItems: 0,
          productsCostCents: 0,
          shippingCostCents: 0,
          totalBeforeTaxCents: 0,
          taxCents: 0,
          totalCents: 0
        }
      });
    }

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

    // Calculate totals
    let totalItems = 0;
    let productsCostCents = 0;
    let shippingCostCents = 0;

    cartItems.forEach(item => {
      const product = productMap[item.productId];
      const deliveryOption = deliveryOptionMap[item.deliveryOptionId];

      if (product && deliveryOption) {
        totalItems += item.quantity;
        productsCostCents += product.priceCents * item.quantity;
        shippingCostCents += deliveryOption.priceCents;
      }
    });

    const totalBeforeTaxCents = productsCostCents + shippingCostCents;
    const taxCents = Math.round(totalBeforeTaxCents * 0.1); // 10% tax
    const totalCents = totalBeforeTaxCents + taxCents;

    res.status(200).json({
      data: {
        totalItems,
        productsCostCents,
        shippingCostCents,
        totalBeforeTaxCents,
        taxCents,
        totalCents
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to calculate payment summary'
    });
  }
};