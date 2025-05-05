
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


// Get performance metrics
export const getPerformanceMetrics = async (req, res) => {
  try {
    const totalOrderItems = await prisma.orderItem.count();

    const totalUsers = await prisma.user.count({
      where: { role: 'USER' },
    });

    const totalCancellations = await prisma.orderItem.count({
      where: { status: 'Cancelled' },
    });

    const deliveredOrderItemsSales = await prisma.orderItem.aggregate({
      where: {
          status: 'Delivered',
      },
      _sum: {
        totalPrice: true,
      },
    });

    const cancelledOrderItemsSales = await prisma.orderItem.aggregate({
      where: {
        order: {
          status: 'Cancelled',
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    const totalSales = 
      (deliveredOrderItemsSales._sum.totalPrice || 0) ;

    const performance = {
      totalOrders: totalOrderItems,
      totalUsers,
      totalCancellations,
      totalSales,
    };

    console.log('Performance data:', performance);
    res.json(performance);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ message: 'Error fetching performance metrics.' });
  }
};



export const updatePerformanceMetrics = async (req, res) => {
  const { totalOrders, totalUsers, totalCancellations, totalSales } = req.body;

  try {
    console.log('Updating performance with:', {
      totalOrders,
      totalUsers,
      totalCancellations,
      totalSales,
    });

    // Try upsert operation with id 1
    const updatedPerformance = await prisma.performance.upsert({
      where: { id: 1 },
      update: {
        totalOrders,
        totalUsers,
        totalCancellations,
        totalSales,  // Update the totalSales
      },
      create: {
        totalOrders,
        totalUsers,
        totalCancellations,
        totalSales,  // Create with totalSales
      },
    });

    console.log('Updated performance:', updatedPerformance);

    res.json({
      message: 'Performance metrics updated',
      performance: updatedPerformance,
    });
  } catch (error) {
    console.error('Error updating performance metrics:', error);
    res.status(500).json({ message: 'Error updating performance metrics.' });
  }
};
