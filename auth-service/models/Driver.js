const mongoose = require("mongoose");

const deliveryDriverSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  driverName: { type: String, required: true },
  email: { type: String, required: true },
  vehicle: { type: String, default: null },
  vehicleNumber: { type: String, default: null },
  phone: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "inactive" },
  currentLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  approvalStatus: {
    type: String,
    enum: ["registered", "approved", "rejected"],
    default: "registered",
  },
});

module.exports = (conn) => conn.model("DeliveryDrivers", deliveryDriverSchema);
