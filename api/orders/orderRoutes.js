import express from 'express';
import {
  getAllOrders,
  getUserOrders,
  createOrder,
  updateOrderStatus,
  requestOrderCancellation,
  updateOrderItemStatus,
  requestItemCancellation,
  ItemCancellation
} from './orderController.js';

const router = express.Router();

// Admin routes
router.get('/', getAllOrders);
router.put('/:orderId/status', updateOrderStatus);
router.put('/item-status/:itemId', updateOrderItemStatus);
router.put('/cancel/:itemId', ItemCancellation);

// User routes
router.get('/:userId', getUserOrders);
router.post('/create', createOrder);
router.put('/cancel/order/:orderId', requestOrderCancellation);
router.put('/cancel-request/:itemId', requestItemCancellation);

export default router;
