const axios = require("axios");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const nodemailer = require("nodemailer");
require("dotenv").config();
const { sendOrderConfirmation } = require("../utils/emailService");

const generateOrderId = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `OR${random}`;
};

// Place an order
exports.placeOrder = async (req, res) => {
  const customerId = req.user.userId;
  const customerName = `${req.user.firstname} ${
    req.user.lastname || ""
  }`.trim();

  const customerEmail = req.user.email;
  const { deliveryAddress, customerMobileNo, paymentMethod, totalAmount } =
    req.body;

  try {
    // Get the user's cart
    const cart = await Cart.findOne({ customerId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty or not found" });
    }

    // Fetch restaurant details from Restaurant Service
    const restaurantId = cart.restaurantId;

    const restaurantResponse = await axios.get(
      `http://localhost:5001/api/restaurants/${restaurantId}`,
      { headers: { Authorization: req.headers.authorization } }
    );

    const restaurantData = restaurantResponse.data;

    // Generate a unique orderId
    let orderId;
    let exists = true;

    while (exists) {
      orderId = generateOrderId();
      const existing = await Order.findOne({ orderId });
      if (!existing) exists = false;
    }

    // Create the order using cart + restaurant + new inputs
    const order = new Order({
      orderId,
      customerId,
      customerName,
      customerMobileNo,
      customerEmail,

      restaurantId: restaurantData._id,
      restaurantName: restaurantData.restaurantName,
      restaurantLocation: restaurantData.location,

      items: cart.items,
      deliveryAddress,
      paymentMethod,
      paymentStatus: "pending",
      status: "pending",
      totalAmount,
    });

    await order.save();

    // Send order confirmation email
    await sendOrderConfirmation(
      customerEmail,
      customerName,
      orderId,
      cart.items,
      order.totalAmount
    );

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
    const orders = await Order.find({ customerId, isHidden: false }).sort({
      createdAt: -1,
    });
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
    const order = await Order.findOne({ orderId: orderId, customerId: customerId });

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

// Get all orders with status 'ready_for_pickup' (for driver)
exports.getAllOrdersForDriver = async (req, res) => {
  try {
    const orders = await Order.find({ status: "ready_for_pickup" }).sort({
      createdAt: -1,
    });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching ready for pickup orders:", err.message);
    res.status(500).json({ error: "Failed to fetch ready for pickup orders" });
  }
};

// Customer updates order before restaurant accepts it
exports.updateOrder = async (req, res) => {
  const customerId = req.user.userId;
  const orderId = req.params.orderId;
  const { deliveryAddress, paymentMethod } = req.body;

  try {
    const order = await Order.findOne({ orderId, customerId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        message: "Cannot update order after it is accepted or processed",
      });
    }

    // Allow updating only certain fields
    if (deliveryAddress) {
      order.deliveryAddress = deliveryAddress;
    }

    if (paymentMethod) {
      if (order.paymentStatus === "paid") {
        return res.status(400).json({
          message: "Cannot change payment method after payment is completed",
        });
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
    const order = await Order.findOne({ orderId, customerId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isHidden = true;
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
    const order = await Order.findOne({ orderId, customerId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isHidden = false;
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
    const order = await Order.findOne({ orderId, customerId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow cancel if restaurant hasn't accepted it yet
    if (order.status !== "pending" && order.status !== "confirmed") {
      return res.status(400).json({
        message: "Cannot cancel order after it is accepted or processed",
      });
    }

    order.status = "cancelled_by_customer";
    order.paymentStatus = "refunded";
    await order.save();

    res.status(200).json({ message: "Order cancelled by customer", order });
  } catch (err) {
    console.error("Error cancelling order:", err.message);
    res.status(500).json({ error: "Failed to cancel order" });
  }
};

//get order only for a specific restaurantId- restOwner
exports.getOrdersByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const orders = await Order.find({ restaurantId });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });

    // Email configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Reusable function to send email
    const sendEmailToCustomer = async (to, subject, text) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
      };
      await transporter.sendMail(mailOptions);
    };

    // Update order status
    exports.updateOrderStatus = async (req, res) => {
      try {
        // Function logic...
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    };
  }
};

// Change it to this:
exports.getOrdersByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const orders = await Order.find({ restaurantId });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use environment variable in production
  },
});

// Reusable function to send email
const sendEmailToCustomer = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };
  await transporter.sendMail(mailOptions);
};

// Update order status - correctly defined as a separate export
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "accepted",
      "preparing",
      "ready_for_pickup",
      "delivery_accepted",
      "delivering",
      "delivered",
      "cancelled_by_customer",
      "cancelled_by_restaurant",
      "cancelled_by_delivery",
      "paid",
      "refunded",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Find the order
    const order = await Order.findOne({ orderId: req.params.id });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update status
    order.status = status;
    await order.save();

    // Email notifications
    if (
      ["delivery_accepted", "delivered", "cancelled_by_delivery"].includes(
        status
      )
    ) {
      let subject = "";
      let text = "";

      switch (status) {
        case "delivery_accepted":
          subject = "Order Picked Up!";
          text = `Hi ${order.customerName}, your order #${order.orderId} has been picked up and is on its way.`;
          break;
        case "delivered":
          subject = "Order Delivered!";
          text = `Hi ${order.customerName}, your order #${order.orderId} has been successfully delivered. Enjoy your meal!`;
          break;
        case "cancelled_by_delivery":
          subject = "Order Cancelled by Delivery";
          text = `Hi ${order.customerName}, we're sorry but your order #${order.orderId} was cancelled by the delivery personnel. Please contact support if you need assistance.`;
          break;
      }

      if (order.customerEmail) {
        await sendEmailToCustomer(order.customerEmail, subject, text);
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// For internal use or admin-level updates
exports.updateOrderAfterConfirmed = async (req, res) => {
  const orderId = req.params.orderId;
  const {
    status,
    paymentStatus,
    paymentCompletedAt,
    deliveryAddress,
    paymentMethod,
  } = req.body;

  try {
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order fields if present in the request
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (paymentCompletedAt) order.paymentCompletedAt = paymentCompletedAt;
    if (deliveryAddress) order.deliveryAddress = deliveryAddress;
    if (paymentMethod) order.paymentMethod = paymentMethod;

    await order.save();

    res.status(200).json({ message: "Order updated by admin", order });
  } catch (err) {
    console.error("Admin order update error:", err.message);
    res.status(500).json({ error: "Failed to update order" });
  }
};
