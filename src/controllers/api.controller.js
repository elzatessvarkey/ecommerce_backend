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
