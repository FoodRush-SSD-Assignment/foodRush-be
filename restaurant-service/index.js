const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config(); // Also here for safety

const app = express();
app.use(express.json());
connectDB();

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

