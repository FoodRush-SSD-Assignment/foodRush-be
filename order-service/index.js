const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();

const cartRoutes = require("./routes/cartRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

app.use("/api/order-service/cart", cartRoutes);
app.use("/api/order-service/order", orderRoutes);

// Start Server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`order service is running on port ${PORT}`);
});