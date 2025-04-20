const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  restaurantId: {
    type: String,
    required: true,
    unique: true,
  },
  restaurantName: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  itemCategories: {
    type: [String], //['Drinks', 'Main Course', 'Desserts']
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: { //admin should set this status
    type: String,
    enum: ['Pending', 'Approved', 'suspended'],
    default: 'Pending',
  },
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
