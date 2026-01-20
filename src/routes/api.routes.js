import express from 'express';
import { getProducts } from '../controllers/product.controller.js';
import { getDeliveryOptions } from '../controllers/delivery.controller.js';
import { getCartItems, postCartItem, putCartItem, deleteCartItem } from '../controllers/cart.controller.js';
import { getOrders, getOrder, postOrder } from '../controllers/order.controller.js';
import { resetDatabase } from '../controllers/utility.controller.js';

const router = express.Router();

router.get('/products', getProducts);
router.get('/delivery-options', getDeliveryOptions);
router.get('/cart-items', getCartItems);
router.post('/cart-items', postCartItem);
router.put('/cart-items/:productId', putCartItem);
router.delete('/cart-items/:productId', deleteCartItem);
router.get('/orders', getOrders);
router.get('/orders/:orderId', getOrder);
router.post('/orders', postOrder);
router.post('/reset', resetDatabase);

export default router;
