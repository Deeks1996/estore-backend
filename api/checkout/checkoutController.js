import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { items, userId, totalAmount, shippingCharge } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    // Stripe expects amounts in smallest currency unit (paise)
    const line_items = items.map(item => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.name,
        },
        unit_amount: item.price, // already in paisa
      },
      quantity: item.quantity,
    }));

    // Add shipping
    if (shippingCharge > 0) {
      line_items.push({
        price_data: {
          currency: 'inr',
          product_data: { name: 'Shipping Fee' },
          unit_amount: shippingCharge,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}&totalAmount=${totalAmount}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: { userId },
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (err) {
    console.error('Stripe Error:', err);
    return res.status(500).json({
      error: 'Something went wrong. Please try again.',
      details: err.message,
    });
  }
};
