const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    mobileno: { type: String },
    address: { type: String },
    dateofbirth: { type: Date },
    nic: { type: String },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    verificationCode: String,
    codeExpiresAt: Date,
    role: {
      type: String,
      enum: ["admin", "customer", "restaurantOwner", "deliveryPerson"],
      default: "customer",
    },
    googleId: { type: String },
    avatar: { type: String },
    locale: { type: String },
    gender: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
