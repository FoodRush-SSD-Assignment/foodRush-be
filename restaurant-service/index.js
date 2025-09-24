const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const restaurantRoutes = require("./routes/restaurantRoutes");
const itemRoutes = require("./routes/itemRoutes");

const app = express();
const cors = require('cors');
const helmet = require("helmet");


app.use(express.json());

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(helmet.frameguard({ action: "deny" }));

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

console.log("✅ Registering /api/restaurants routes");
app.use('/api/restaurants', restaurantRoutes);

console.log("✅ Registering /api/items routes");
app.use('/api/items', itemRoutes);

connectDB();

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 restaurant service is running on port ${PORT}`);
});

