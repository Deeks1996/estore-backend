import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const saveOrderToDatabase = async (session) => {
  try {
    const { id: stripeSessionId, amount_total, metadata, customer_email } = session;

    const userId = metadata?.userId ? parseInt(metadata.userId) : null;

    const cartItems = await prisma.cart.findMany({
      where: { userId },
    });

    const order = await prisma.order.create({
      data: {
        stripeSessionId,
        email: customer_email,
        totalAmount: amount_total / 100,
        status: 'Ordered',
        createdAt: new Date(),
        userId,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    await prisma.cart.deleteMany({
      where: { userId },
    });

    console.log(' Order saved to DB and cart cleared:', order.id);
  } catch (error) {
    console.error(' Error saving order to DB:', error);
  }
};
