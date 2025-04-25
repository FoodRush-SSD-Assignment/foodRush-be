const mongoose = require("mongoose");

const connectUserDB = async () => {
  try {
    await mongoose.connect(process.env.AUTH_DB_URI);
    console.log("✅ Auth DB connected");
  } catch (err) {
    console.error("❌ Failed to connect Auth DB:", err.message);
    process.exit(1);
  }
};

const connectDeliveryDB = async () => {
  try {
    const conn = await mongoose.createConnection(process.env.DVLIVERY_DB_URI);
    console.log("✅ Delivery DB connected");
    return conn;
  } catch (err) {
    console.error("❌ Failed to connectDelivery DB:", err.message);
    process.exit(1);
  }
};

module.exports = {
  connectDeliveryDB,
  connectUserDB,
};
