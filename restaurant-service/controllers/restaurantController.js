const Restaurant = require('../models/Restaurant');

// Create a new restaurant
exports.createRestaurant = async (req, res) => {
  try {
    const { 
      restaurantName,
      ownerId, 
      location, 
      contactNumber, 
      category 
    } = req.body;

    const imageUrl = req.file?.path;
    
    const newRestaurant = new Restaurant({
      restaurantName,
      ownerId,
      location,
      contactNumber,
      category,
      imageUrl
    });
    
    await newRestaurant.save();
    res.status(201).json(newRestaurant);
  } catch (err) {
    console.error('Error creating restaurant:', err);
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
    const restaurant = await Restaurant.findOne({ _id: req.params.id }); 
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a restaurant
exports.updateRestaurant = async (req, res) => {
  try {
    const updated = await Restaurant.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }); 
    if (!updated) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a restaurant
exports.deleteRestaurant = async (req, res) => {
  try {
    const deleted = await Restaurant.findOneAndDelete({ _id: req.params.id }); 
    if (!deleted) return res.status(404).json({ error: 'Restaurant not found' });
    res.json({ message: 'Restaurant deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin-only: Update restaurant status
exports.updateRestaurantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Approved', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      { _id: req.params.id }, 
      { status },
      { new: true }
    );

    if (!updatedRestaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
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
    const restaurants = await Restaurant.find({ category: type.toLowerCase(), status: 'Approved' });
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRestaurantsByOwnerId = async (req, res) => {
  try {
    const ownerId = req.params.id; // Get ownerId from URL parameter

    if (!ownerId) {
      return res.status(400).json({ error: "Owner ID is required in the URL parameter" });
    }
    
    // Fetch restaurants that match the ownerId
    const restaurants = await Restaurant.find({ ownerId: ownerId });

    if (restaurants.length > 0) {
      return res.json(restaurants);
    } else {
      return res.status(404).json({ message: "No restaurants found for this ownerId" });
    }
  } catch (err) {
    console.error("Error in getRestaurantsByOwnerId:", err);
    return res.status(500).json({ error: err.message });
  }
};




