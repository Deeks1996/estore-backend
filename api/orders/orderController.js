import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Admin: Get all orders (including orderItems)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { orderItems: true },
    });
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return res.status(500).json({ message: 'Server error fetching orders.' });
  }
};

// User: Get orders for a specific user
export const getUserOrders = async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { orderItems: true },
    });
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({ message: 'Server error fetching user orders.' });
  }
};

// Create order with order items
export const createOrder = async (req, res) => {
  const { userId, email, totalAmount, status, stripeSessionId, items } = req.body;

  if (!userId || !email || !totalAmount || !status || !stripeSessionId || !Array.isArray(items)) {
    return res.status(400).json({ message: 'Invalid order details.' });
  }

  try {
    const order = await prisma.order.create({
      data: {
        userId,
        email,
        totalAmount: parseFloat(totalAmount),
        status,
        stripeSessionId,
        orderItems: {
          create: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.price * item.quantity,
            status: 'Ordered',
          })),
        },
      },
      include: { orderItems: true },
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ message: 'Server error creating order.' });
  }
};

// Admin: Update order status
export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status },
    });

    return res.status(200).json({ message: 'Order status updated', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ message: 'Server error updating order status.' });
  }
};

// Request cancellation of entire order
export const requestOrderCancellation = async (req, res) => {
  const { orderId } = req.params;

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        status: 'Cancel Requested',
        cancellationRequested: true,
      },
    });

    return res.status(200).json({ message: 'Order cancellation requested', order: updatedOrder });
  } catch (error) {
    console.error('Error requesting order cancellation:', error);
    return res.status(500).json({ message: 'Server error requesting cancellation.' });
  }
};

// Update individual order item status (admin)
export const updateOrderItemStatus = async (req, res) => {
  const { itemId } = req.params;
  const { status } = req.body;

  try {
    const item = await prisma.orderItem.findUnique({
      where: { id: parseInt(itemId) },
    });

    if (!item) return res.status(404).json({ message: 'Order item not found' });

    if (item.status === 'CancelRequested' && status !== 'Cancelled' && status !== 'Dispatched') {
      return res.status(400).json({ message: 'Cannot update item in CancelRequested state' });
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id: parseInt(itemId) },
      data: { status },
    });

    return res.status(200).json({ message: 'Order item status updated', updatedItem });
  } catch (error) {
    console.error('Error updating item status:', error);
    return res.status(500).json({ message: 'Server error updating item status.' });
  }
};

// Request individual item cancellation
export const requestItemCancellation = async (req, res) => {
  const { itemId } = req.params;

  try {
    const item = await prisma.orderItem.findUnique({
      where: { id: parseInt(itemId) },
    });

    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.status === 'Cancelled' || item.status === 'CancelRequested') {
      return res.status(400).json({ message: 'Item already in cancellation process' });
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id: parseInt(itemId) },
      data: { status: 'CancelRequested' },
    });

    return res.status(200).json({ message: 'Cancellation requested', updatedItem });
  } catch (error) {
    console.error('Error requesting item cancellation:', error);
    return res.status(500).json({ message: 'Server error requesting item cancellation.' });
  }
};


// Admin - Approve cancellation
export const ItemCancellation = async (req, res) => {
  const { itemId } = req.params;

  try {
    const item = await prisma.orderItem.findUnique({ where: { id: parseInt(itemId) } });

    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.status !== 'CancelRequested') {
      return res.status(400).json({ error: 'Item is not in a cancellable state' });
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id: item.id },
      data: { status: 'Cancelled' },
    });

    return res.status(200).json({ message: 'Item cancelled successfully', item: updatedItem });
  } catch (error) {
    console.error('Error cancelling item:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};