const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  const { items, orderId } = req.body;

  try {
    // Create the Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: items.map((item) => ({
        price_data: {
          currency: "lkr", // or "lkr" if you're switching to LKR
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100, // convert to cents
        },
        quantity: item.quantity,
      })),
      success_url: `${process.env.CLIENT_URL}/stripe-success?session_id={CHECKOUT_SESSION_ID}`, // The success URL with the session ID
      cancel_url: `${process.env.CLIENT_URL}/cart`, // The cancel URL if the user cancels the payment
      metadata: {
        orderId: orderId,
      },
    });

    // Respond with the session ID to the frontend
    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};
