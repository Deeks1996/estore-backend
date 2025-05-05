
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

export const createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
        createdAt: new Date(), 
        updatedAt: new Date(), 
      },
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};

// update a category
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  console.log('UPDATE CATEGORY ID:', id, typeof id); 

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name,
      },
    });
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error.message);
    return res.status(500).json({
      message: 'Failed to update category',
      error: error.message,
      stack: error.stack,
    });
  }
};


// DELETE a category
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.category.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
};
