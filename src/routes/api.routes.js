import express from 'express';
import { getProducts, getDeliveryOptions, getCartItems } from '../controllers/api.controller.js';

const router = express.Router();

router.get('/products', getProducts);
router.get('/delivery-options', getDeliveryOptions);
router.get('/cart-items', getCartItems);

export default router;
