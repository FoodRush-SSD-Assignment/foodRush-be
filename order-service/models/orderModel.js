const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true },
    customerId: { type: String, required: true },
    customerName: { type: String },
    customerMobileNo: { type: String },

    restaurantId: { type: String, required: true },
    restaurantName: { type: String },
    restaurantLocation: { type: String },
    deliveryAddress: { type: String },

    items: [
      {
        name: String,
        quantity: Number,
        price: Number,
      },
    ],

    totalPrice: { type: Number },
    totalAmount: { type: Number },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "mobile_wallet"],
      default: "card",
    },

    status: {
      type: String,
      enum: [
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
      ],
      default: "pending",
    },

    // Delivery Details
    deliveryPersonId: { type: String },
    deliveryPersonName: { type: String },

    liveLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },

    estimatedDeliveryTime: { type: Date },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-calculate total price
OrderSchema.pre("save", async function (next) {
  this.totalPrice = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // If totalAmount is not set, set it = totalPrice + fixed tax/delivery (optional)
  if (!this.totalAmount) {
    const taxAmount = this.items.reduce((sum, item) => sum + item.quantity * 2, 0);
    const deliveryFee = 250;
    this.totalAmount = this.totalPrice + taxAmount + deliveryFee;
  }

  if (!this.orderId) {
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const newOrderId = `OR${randomId}`;

      const existingOrder = await mongoose
        .model("Order")
        .findOne({ orderId: newOrderId });

      if (!existingOrder) {
        this.orderId = newOrderId;
        isUnique = true;
      }

      attempts++;
    }

    if (!isUnique) {
      return next(
        new Error("Failed to generate unique orderId after multiple attempts")
      );
    }
  }

  next();
});

module.exports = mongoose.model("Order", OrderSchema);
