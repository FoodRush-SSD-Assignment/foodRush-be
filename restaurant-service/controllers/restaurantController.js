const Restaurant = require('../models/Restaurant');

// Create a new restaurant
exports.createRestaurant = async (req, res) => {
  try {
    const newRestaurant = new Restaurant(req.body);
    await newRestaurant.save();
    res.status(201).json(newRestaurant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all restaurants
exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one restaurant by ID
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a restaurant
exports.updateRestaurant = async (req, res) => {
  try {
    const updated = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a restaurant
exports.deleteRestaurant = async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Restaurant deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
