import express from 'express';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from './categoryController.js';

const router = express.Router();

router.get('/', getAllCategories);            
router.post('/create', createCategory);             
router.put('/:id', updateCategory);         
router.delete('/:id', deleteCategory);       

export default router;