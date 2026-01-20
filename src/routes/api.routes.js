import express from 'express';
import { getProducts, getDeliveryOptions } from '../controllers/api.controller.js';

const router = express.Router();

router.get('/products', getProducts);
router.get('/delivery-options', getDeliveryOptions);

export default router;
