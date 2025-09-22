const Restaurant = require("../models/Restaurant");
const nodemailer = require("nodemailer");
require("dotenv").config();
const axios = require("axios");

// Create a new restaurant
exports.createRestaurant = async (req, res) => {
  try {
    const { restaurantName, ownerId, location, contactNumber, category } =
      req.body;

    const imageUrl = req.file?.path;

    const newRestaurant = new Restaurant({
      restaurantName,
      ownerId,
      location,
      contactNumber,
      category,
      imageUrl,
    });

    await newRestaurant.save();
    res.status(201).json(newRestaurant);
  } catch (err) {
    console.error("Error creating restaurant:", err);
    res.status(400).json({ error: err.message });
  }
};

// Get all restaurants
exports.getRestaurants = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "customer") {
      query.status = "Approved";
    }
    const restaurants = await Restaurant.find(query);
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one restaurant by ID
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id });
    if (req.user.role === "customer" && restaurant.status !== "Approved") {
      return res.status(403).json({ error: "You cannot access this restaurant" });
    }
    if (!restaurant)
      return res.status(404).json({ error: "Restaurant not found" });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a restaurant
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

    if (req.user.role === "restaurantOwner" && restaurant.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "You can only update your own restaurant" });
    }
    const updated = await Restaurant.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ error: "Restaurant did not updated" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a restaurant
exports.deleteRestaurant = async (req, res) => {
  try {
    const deleted = await Restaurant.findOneAndDelete({ _id: req.params.id });
    if (!deleted)
      return res.status(404).json({ error: "Restaurant not found" });
    res.json({ message: "Restaurant deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin-only: Update restaurant status
exports.updateRestaurantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Approved", "Suspended"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      { _id: req.params.id },
      { status },
      { new: true }
    );

    if (!updatedRestaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.json(updatedRestaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get restaurants by category
exports.getRestaurantsByCategory = async (req, res) => {
  try {
    const { type } = req.params;
    const restaurants = await Restaurant.find({
      category: type.toLowerCase(),
      status: "Approved",
    });
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRestaurantsByOwnerId = async (req, res) => {
  try {
    const ownerId = req.params.id; // Get ownerId from URL parameter

    if (!ownerId) {
      return res
        .status(400)
        .json({ error: "Owner ID is required in the URL parameter" });
    }

    // If user is restaurantOwner, they can only fetch their own restaurants
    if (req.user.role === "restaurantOwner" && req.user.userId !== ownerId) {
      return res.status(403).json({ error: "You can only view your own restaurants" });
    }

    // Fetch restaurants that match the ownerId
    const restaurants = await Restaurant.find({ ownerId });

    if (restaurants.length > 0) {
      return res.json(restaurants);
    } else {
      return res
        .status(404)
        .json({ message: "No restaurants found for this ownerId" });
    }
  } catch (err) {
    console.error("Error in getRestaurantsByOwnerId:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Define the sendEmail function
const sendEmail = async ({ to, subject, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"FoodRush" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("Email sent:", info.response);
  } catch (err) {
    console.error("sendEmail error:", err);
    throw err;
  }
};

// Define the controller using sendEmail
exports.sendOrderCancellationEmail = async (req, res) => {
  const { customerEmail, orderId, customerName, cancellationReason } = req.body;

  if (!customerEmail || !orderId || !customerName || !cancellationReason) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    await sendEmail({
      to: customerEmail,
      subject: `Order #${orderId} Cancelled`,
      text: `Hello ${customerName}, your order #${orderId} has been cancelled. Reason: ${cancellationReason}`,
    });

    return res
      .status(200)
      .json({ success: true, message: "Cancellation email sent" });
  } catch (error) {
    console.error("Email sending failed:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send email" });
  }
};
