const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const restaurantRoutes = require("./routes/restaurantRoutes");

const app = express();
app.use(express.json());

console.log("✅ Registering /api/restaurants routes");
app.use('/api/restaurants', restaurantRoutes);

connectDB();

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

