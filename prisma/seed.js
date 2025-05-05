import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const categories = [
  { name: 'Clothing' },
  { name: 'Cosmetics' },
  { name: 'Electronics' },
  { name: 'Books' },
  { name: 'Kitchen' },
  { name: 'Furniture' }
];

const products = [
  {
    name: "Men's T-Shirt",
    price: 749.99,
    imageUrl: "/products/clothing.jpg",
    categoryName: 'Clothing'
  },
  {
    name: "Lipstick Set",
    price: 329.99,
    imageUrl: "/products/cosmetics.jpg",
    categoryName: 'Cosmetics'
  },
  {
    name: "Bluetooth Speaker",
    price: 999.99,
    imageUrl: "/products/electronics.jpg",
    categoryName: 'Electronics'
  },
  {
    name: "Fiction Novel",
    price: 419.99,
    imageUrl: "/products/books.jpg",
    categoryName: "Books"
  },
  {
    name: "Knife Set",
    price: 159.99,
    imageUrl: "/products/kitchen.jpg",
    categoryName: "Kitchen"
  },
  {
    name: "Men's Jeans",
    price: 959.99,
    imageUrl: "/products/clothing2.jpg",
    categoryName: "Clothing"
  },
  {
    name: "Women's Kurtha Set",
    price: 1049.99,
    imageUrl: "/products/clothing3.jpg",
    categoryName: "Clothing"
  },
  {
    name: "Women's Regular Fit",
    price: 2069.99,
    imageUrl: "/products/clothing4.jpg",
    categoryName: "Clothing"
  },
  {
    name: "Women's Jumpsuit",
    price: 1589.99,
    imageUrl: "/products/clothing5.jpg",
    categoryName: "Clothing"
  },
  {
    name: "Eyeshadow Palette",
    price: 429.99,
    imageUrl: "/products/cosmetics2.jpg",
    categoryName: "Cosmetics"
  },
  {
    name: "Mascara",
    price: 229.99,
    imageUrl: "/products/cosmetics3.jpg",
    categoryName: "Cosmetics"
  },
  {
    name: "Eyeliner",
    price: 129.99,
    imageUrl: "/products/cosmetics4.jpg",
    categoryName: "Cosmetics"
  },
  {
    name: "Foundation",
    price: 429.99,
    imageUrl: "/products/cosmetics5.jpg",
    categoryName: "Cosmetics"
  },
  {
    name: "Iphone 15 Pro",
    price: 89999.99,
    imageUrl: "/products/electronics2.jpg",
    categoryName: "Electronics"
  },
  {
    name: "Bluetooth Headphones",
    price: 899.99,
    imageUrl: "/products/electronics3.jpg",
    categoryName: "Electronics"
  },
  {
    name: "Smart TV",
    price: 50499.99,
    imageUrl: "/products/electronics5.jpg",
    categoryName: "Electronics"
  },
  {
    name: "Smart Watch",
    price: 2199.99,
    imageUrl: "/products/electronics4.jpg",
    categoryName: "Electronics"
  },
  {
    name: "Computer desk",
    price: 5199.99,
    imageUrl: "/products/furniture2.jpg",
    categoryName: "Furniture"
  },
  {
    name: "Teapoy",
    price: 3199.99,
    imageUrl: "/products/furniture3.jpg",
    categoryName: "Furniture"
  },
  {
    name: "Shoe Rack",
    price: 3199.99,
    imageUrl: "/products/furniture4.jpg",
    categoryName: "Furniture"
  },
  {
    name: "Book Shelf",
    price: 4199.99,
    imageUrl: "/products/furniture5.jpg",
    categoryName: "Furniture"
  },
  {
    name: "Web Design",
    price: 319.99,
    imageUrl: "/products/books1.jpg",
    categoryName: "Books"
  },
  {
    name: "AI For Beginners",
    price: 519.99,
    imageUrl: "/products/books2.jpg",
    categoryName: "Books"
  },
  {
    name: "Data Science Basics",
    price: 419.99,
    imageUrl: "/products/books3.jpg",
    categoryName: "Books"
  },
  {
    name: "Python",
    price: 619.99,
    imageUrl: "/products/books4.jpg",
    categoryName: "Books"
  },
  {
    name: "Nonstick Pan",
    price: 359.99,
    imageUrl: "/products/kitchen2.jpg",
    categoryName: "Kitchen"
  },
  {
    name: "Spoon set",
    price: 259.99,
    imageUrl: "/products/kitchen4.jpg",
    categoryName: "Kitchen"
  },
  {
    name: "Vessel",
    price: 459.99,
    imageUrl: "/products/kitchen3.jpg",
    categoryName: "Kitchen"
  },
  {
    name: "Bottles",
    price: 359.99,
    imageUrl: "/products/kitchen5.jpg",
    categoryName: "Kitchen"
  }
];

async function main() {
  const createdCategories = {};

  // Create or update categories
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name }
    });
    createdCategories[cat.name] = created.id;
  }

  // Insert new products with auto SKU
  let skuCounter = 1;
  for (const product of products) {
    const sku = `SKU${skuCounter.toString().padStart(3, '0')}`;
    skuCounter++;

    await prisma.product.create({
      data: {
        sku,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        categoryId: createdCategories[product.categoryName]
      }
    });
  }

  console.log('✅ Products seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });