import models from '../models/index.js';

export const getDeliveryOptions = async (req, res) => {
  try {
    const deliveryOptions = await models.DeliveryOption.findAll();

    if (req.query.expand === 'estimatedDeliveryTime') {
      // Add estimated delivery time to each option
      const expandedDeliveryOptions = deliveryOptions.map(option => ({
        ...option.toJSON(),
        estimatedDeliveryTimeMs: Date.now() + (option.deliveryDays * 24 * 60 * 60 * 1000)
      }));

      res.status(200).json({
        data: expandedDeliveryOptions
      });
    } else {
      res.status(200).json({
        data: deliveryOptions
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch delivery options'
    });
  }
};