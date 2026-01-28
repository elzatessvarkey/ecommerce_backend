import fs from 'fs';
import path from 'path';
import Fuse from 'fuse.js';
import models from '../models/index.js';

export const getProducts = async (req, res) => {
  try {
    // Fetch products from database instead of JSON file
    let products = await models.Product.findAll();
    
    // Convert to plain objects if needed
    products = products.map(p => p.toJSON ? p.toJSON() : p);
    
    // Fuzzy search if query parameter is provided
    const searchQuery = req.query.search;
    if (searchQuery) {
      const fuse = new Fuse(products, {
        keys: ['name', 'keywords'],
        threshold: 0.4, // Allows for fuzzy matching with up to 40% mismatch
        minMatchCharLength: 1,
        includeScore: false
      });
      products = fuse.search(searchQuery).map(result => result.item);
    }
    
    res.status(200).json({
      data: products
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch products'
    });
  }
};