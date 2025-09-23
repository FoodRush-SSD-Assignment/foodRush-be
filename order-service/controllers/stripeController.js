const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/orderModel");

exports.createCheckoutSession = async (req, res) => {
  // Only accept the orderId from the client, as this is the only trusted piece of data
  const { orderId } = req.body;

  try {
    // Fetch the order from the database
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Re-calculate all amounts on the server using trusted data
    // The delivery fee is a fixed, known value
    const deliveryFee = 250.0;

    // The tax amount is calculated based on the item quantities
    const taxAmount = order.items.reduce(
      (total, item) => total + item.quantity * 2,
      0
    );

    // Create line items for the Stripe checkout session
    const lineItems = [
      ...order.items.map((item) => ({
        price_data: {
          currency: "lkr",
          product_data: {
            name: item.name,
          },
          // Price should come from the database to prevent tampering
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
