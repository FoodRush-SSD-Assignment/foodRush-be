const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  _id:{
    type: String,
    unique: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  itemDescription: {
    type: String,
  },
  itemPrice: {
    type: Number,
    required: true,
  },
  itemCategory: {
    type: String,
    enum: [
      'mains', 
      'sides',
      'desserts', 
      'beverages'
    ],
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  restaurantId: {
    type: String,
    required: true,
    ref: "Restaurant",
  },
  restaurantName: {
    type: String,
    required: true,
    ref: "Restaurant",
  },
});

// Generate custom _id like "ITM123"
itemSchema.pre("save", async function (next) {
  if (this._id) return next();

  try {
    this._id = "ITM" + Math.floor(Math.random() * 900 + 100);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Item", itemSchema);
