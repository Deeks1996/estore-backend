import Stripe from 'stripe';
import dotenv from 'dotenv';
import { saveOrderToDatabase } from '../../helpers/orderUtils.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verifying the webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_ENDPOINT_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed':
      console.log('Checkout session completed');

      // Ensure the order is saved to the database with the userId from metadata
      await saveOrderToDatabase(session);

      break;

    case 'payment_intent.succeeded':
      console.log('Payment succeeded:', session.id);

      // Update the order's status in the database to 'Ordered'
      const userId = session.metadata.userId; // Retrieve userId from metadata
      await prisma.order.updateMany({
        where: { stripeSessionId: session.id },
        data: {
          status: 'Ordered',
          userId: userId, // Ensure the correct user is linked to the order
        },
      });
      break;

    case 'payment_intent.payment_failed':
      console.log('Payment failed:', session.id);

      // Update the order's status in the database to 'Cancelled'
      await prisma.order.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: 'Cancelled' },
      });
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Responding with a 200 status code to acknowledge receipt of the event
  res.status(200).json({ received: true });
};
