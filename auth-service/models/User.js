const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobileno: { type: String },
    address: { type: String },
    dateofbirth: { type: Date },
    nic: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationCode: String,
    codeExpiresAt: Date,
    role: {
      type: String,
      enum: ["admin", "customer", "restaurantOwner", "deliveryPerson"],
      default: "customer",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
