const axios = require("axios");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");

// Place an order
exports.placeOrder = async (req, res) => {
  const customerId = req.user.userId;
  const customerName = `${req.user.firstname} ${req.user.lastname || ""}`.trim();
  const { deliveryAddress, paymentMethod } = req.body;

  try {
    // Get the user's cart
    const cart = await Cart.findOne({ customerId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty or not found" });
    }

    // Fetch restaurant details from Restaurant Service
    const restaurantId = cart.restaurantId;

    const restaurantResponse = await axios.get(`http://localhost:5001/api/restaurants/${restaurantId}`,
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


// Retrieve all current and archived orders for the logged-in user 
// This is for customer side order history
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


// Get all orders without archived orders for the current user
// This is for customer side current orders
exports.getCurrentOrders = async (req, res) => {
  const customerId = req.user.userId;

  try {
    const orders = await Order.find({ customerId, isHiddenTrue: false }).sort({ createdAt: -1 });
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


// Get all orders in the system (admin only)
exports.getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching all orders:", err.message);
    res.status(500).json({ error: "Failed to fetch all orders" });
  }
};


// Customer updates order before restaurant accepts it
exports.updateOrder = async (req, res) => {
  const customerId = req.user.userId;
  const orderId = req.params.orderId;
  const { deliveryAddress, paymentMethod } = req.body;

  try {
    const order = await Order.findOne({ _id: orderId, customerId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Cannot update order after it is accepted or processed" });
    }

    // Allow updating only certain fields
    if (deliveryAddress) {
      order.deliveryAddress = deliveryAddress;
    }

    if (paymentMethod) {
      if (order.paymentStatus === "paid") {
        return res.status(400).json({ message: "Cannot change payment method after payment is completed" });
      }
      order.paymentMethod = paymentMethod;
    }    

    await order.save();

    res.status(200).json({ message: "Order updated", order });
  } catch (err) {
    console.error("Error updating order:", err.message);
    res.status(500).json({ error: "Failed to update order" });
  }
};


// Hide an order (customer side only)
exports.hideOrder = async (req, res) => {
  const customerId = req.user.userId;
  const orderId = req.params.orderId;

  try {
    const order = await Order.findOne({ _id: orderId, customerId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isHiddenTrue = true;
    await order.save();

    res.status(200).json({ message: "Order hidden successfully" });
  } catch (err) {
    console.error("Error hiding order:", err.message);
    res.status(500).json({ error: "Failed to hide order" });
  }
};


// Unhide a previously hidden order
exports.unhideOrder = async (req, res) => {
  const customerId = req.user.userId;
  const orderId = req.params.orderId;

  try {
    const order = await Order.findOne({ _id: orderId, customerId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isHiddenTrue = false;
    await order.save();

    res.status(200).json({ message: "Order unhidden successfully" });
  } catch (err) {
    console.error("Error unhiding order:", err.message);
    res.status(500).json({ error: "Failed to unhide order" });
  }
};


// Cancel an order by customer before restaurant accepts it
exports.cancelOrderByCustomer = async (req, res) => {
  const customerId = req.user.userId;
  const orderId = req.params.orderId;

  try {
    const order = await Order.findOne({ _id: orderId, customerId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow cancel if restaurant hasn't accepted it yet
    if (order.status !== "pending" && order.status !== "confirmed") {
      return res.status(400).json({ message: "Cannot cancel order after it is accepted or processed" });
    }

    order.status = "cancelled_by_customer";
    await order.save();

    res.status(200).json({ message: "Order cancelled by customer", order });
  } catch (err) {
    console.error("Error cancelling order:", err.message);
    res.status(500).json({ error: "Failed to cancel order" });
  }
};
