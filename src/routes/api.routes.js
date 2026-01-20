import express from 'express';
import { getProducts, getDeliveryOptions, getCartItems, postCartItem, putCartItem, deleteCartItem } from '../controllers/api.controller.js';

const router = express.Router();

router.get('/products', getProducts);
router.get('/delivery-options', getDeliveryOptions);
router.get('/cart-items', getCartItems);
router.post('/cart-items', postCartItem);
router.put('/cart-items/:productId', putCartItem);
router.delete('/cart-items/:productId', deleteCartItem);

export default router;
