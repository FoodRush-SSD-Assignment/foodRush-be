const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();

const cartRoutes = require("./routes/cartRoutes.js");

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

app.use("/api/order-service/cart", cartRoutes);

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});