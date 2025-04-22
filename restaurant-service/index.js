const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const restaurantRoutes = require("./routes/restaurantRoutes");
const itemRoutes = require("./routes/itemRoutes");

const app = express();
app.use(express.json());

console.log("✅ Registering /api/restaurants routes");
app.use('/api/restaurants', restaurantRoutes);

console.log("✅ Registering /api/items routes");
app.use('/api/items', itemRoutes);

connectDB();

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 restaurant service is running on port ${PORT}`);
});

