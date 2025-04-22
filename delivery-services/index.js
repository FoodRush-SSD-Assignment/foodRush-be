const express = require("express");
const connectDBs = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;
const mongoose = require("mongoose");


connectDBs().then(({ db1, db2 }) => {
  // Example model definition on db1 and db2
  const User = db1.model("deliveredOrders", new mongoose.Schema({ name: String }));
  const Order = db2.model("orders", new mongoose.Schema({ total: Number }));

  app.get("/", (req, res) => {
    res.send("✅ Two MongoDB databases connected!");
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
});
