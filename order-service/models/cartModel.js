const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  customerName: { type: String },

  restaurantId: { type: String, required: true },
  restaurantName: { type: String },

  items: [
    {
      name: String,
      quantity: Number,
      price: Number,
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Cart", CartSchema);
