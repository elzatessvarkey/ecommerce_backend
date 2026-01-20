import express from 'express';
import { healthCheck, getProducts } from '../controllers/api.controller.js';

const router = express.Router();

router.get('/health', healthCheck);
router.get('/products', getProducts);

export default router;
