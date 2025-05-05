import { PrismaClient } from '@prisma/client';
import cloudinary from 'cloudinary';
import { clerkClient } from '@clerk/clerk-sdk-node';

const prisma = new PrismaClient();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    res.status(200).json({ success: true, data: products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get a single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  const { name, sku, price, categoryName, image } = req.body;

  console.log("Received:", req.body);

  // Validation
  if (!name || !sku || !price || !categoryName || !image) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (isNaN(price)) {
    return res.status(400).json({ error: 'Invalid price' });
  }

  try {
    // Find the category by name to get the categoryId
    const category = await prisma.category.findUnique({
      where: { name: categoryName },
    });

    if (!category) {
      return res.status(400).json({ error: 'Category not found' });
    }

    // Create the product with the found categoryId
    const newProduct = await prisma.product.create({
      data: {
        name,
        sku,
        price: parseFloat(price),
        categoryId: category.id,  
        imageUrl: image,
      },
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    console.error("Error while creating product:", err);
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
};



// Update an existing product
export const updateProduct = async (req, res) => {
  const { name, description, price, categoryName, imageUrl } = req.body;

  try {
    let newImageUrl = null;
    if (imageUrl) {
      // Upload image to Cloudinary if it's provided
      const uploadedImage = await cloudinary.uploader.upload(imageUrl, {
        folder: 'products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
      });
      newImageUrl = uploadedImage.secure_url;
    }

    // Find the category ID by category name
    const category = await prisma.category.findUnique({
      where: { name: categoryName }, // Assuming 'name' is a unique field in the Category model
    });

    if (!category) {
      return res.status(400).json({ error: 'Category not found' });
    }

    // Update product in the database
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        // Use 'connect' to link the category using the found categoryId
        category: {
          connect: { id: category.id }, // Connect the category using the fetched category ID
        },
        imageUrl: newImageUrl || undefined, // If imageUrl is not provided, set it to undefined
      },
    });

    res.json({ success: true, data: updatedProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
