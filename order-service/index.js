const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();

const cors = require("cors"); // ✅ Import cors

const cartRoutes = require("./routes/cartRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const stripeRoutes = require("./routes/stripeRoutes.js");

const app = express();
app.use(express.json());

// ✅ Enable CORS only for frontend at http://localhost:5173
app.use(cors({ origin: "http://localhost:5173" }));

// Connect to MongoDB
connectDB();

app.use("/api/order-service/cart", cartRoutes);
app.use("/api/order-service/order", orderRoutes);
app.use("/api/order-service/stripe", stripeRoutes);

// Start Server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`order service is running on port ${PORT}`);
});
