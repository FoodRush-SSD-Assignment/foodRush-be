const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  _id: {
    type: String,
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

// Pre-save middleware to generate a random _id ' eg:"RST321" '
RestaurantSchema.pre('save', async function (next) {
  if (this._id) return next(); // already has ID (maybe from import or test)

  const generateUniqueId = async () => {
    let generatedId = 'RST' + Math.floor(Math.random() * 900) + 100; // Random number between 100 and 999

    // Check if the generatedId already exists in the database
    const existingRestaurant = await mongoose.model('Restaurant').findOne({ _id: generatedId });
    if (existingRestaurant) {
      // If it exists, generate a new ID recursively
      return generateUniqueId();
    }
    
    return generatedId;
  };

  try {
    // Generate a unique restaurantId
    this._id = await generateUniqueId();
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
