import express from 'express';
import { getPerformanceMetrics, updatePerformanceMetrics } from './performanceController.js';

const router = express.Router();

router.get('/performance', getPerformanceMetrics); 
router.put('/performance', updatePerformanceMetrics);  

export default router;