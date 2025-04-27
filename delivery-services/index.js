const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDBs = require("./config/db");
const orderRoutes = require("./Routes/orderRoutes");
const deliveryDriverRoutes = require("./Routes/deliveryDriverRoutes");
const { setDriverDb } = require("./controllers/deliveryDriverController");
const { setOrderDb } = require("./controllers/orderController"); // to inject db2

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

connectDBs().then(({ db1, db2 }) => {
  // You can still define models if needed
  const User = db1.model("deliveredOrders", new mongoose.Schema({ name: String }));
  const Order = db2.model("orders", new mongoose.Schema({ total: Number }));

  // Inject db2 into controller
  setDriverDb(db1);  // Inject db1 into orderController
  setOrderDb(db2); 

  // Routes
  app.use("/api", orderRoutes);
  app.use("/api/delivery-drivers", deliveryDriverRoutes); // GET /api/orders

  app.get("/", (req, res) => {
    res.send("✅ Two MongoDB databases connected!");
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
});
