import fs from 'fs';
import path from 'path';

export const healthCheck = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running'
  });
};

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
