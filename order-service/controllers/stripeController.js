const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  const { items, orderId, taxAmount, deliveryFee } = req.body;

  try {
    const lineItems = [
      ...items.map((item) => ({
        price_data: {
          currency: "lkr",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      {
        price_data: {
          currency: "lkr",
          product_data: { name: "Tax" },
          unit_amount: taxAmount * 100,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "lkr",
          product_data: { name: "Delivery Fee" },
          unit_amount: deliveryFee * 100,
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      metadata: {
        orderId: orderId,
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};
