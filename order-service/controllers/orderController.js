const axios = require("axios");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");

exports.placeOrder = async (req, res) => {
  const customerId = req.user.userId;
  const customerName = req.user.username;
  const { deliveryAddress, paymentMethod } = req.body;

  try {
    // Get the user's cart
    const cart = await Cart.findOne({ customerId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty or not found" });
    }

    // Fetch restaurant details from Restaurant Service
    const restaurantId = cart.restaurantId;

    const restaurantResponse = await axios.get(`http://localhost:5002/api/restaurants/${restaurantId}`,
      { headers: { Authorization: req.headers.authorization } }
    );

    const restaurantData = restaurantResponse.data;

    // Create the order using cart + restaurant + new inputs
    const order = new Order({
      customerId,
      customerName,

      restaurantId: restaurantData._id,
      restaurantName: restaurantData.restaurantName,
      restaurantLocation: restaurantData.location,

      items: cart.items,
      deliveryAddress,
      paymentMethod,
      paymentStatus: "pending",
      status: "pending"
    });

    await order.save();

    // Clear the cart
    await Cart.deleteOne({ _id: cart._id });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("Error placing order:", err.message);
    res.status(500).json({ error: "Failed to place order" });
  }
};


// Get all orders for the current user
exports.getAllOrders = async (req, res) => {
  const customerId = req.user.userId;

  try {
    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};


// Get a specific order by ID for the current user
exports.getOrderById = async (req, res) => {
  const customerId = req.user.userId;
  const orderId = req.params.orderId;

  try {
    const order = await Order.findOne({ _id: orderId, customerId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error("Error fetching order:", err.message);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};
