const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectUserDB, connectDeliveryDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

(async () => {
  // Connect main auth database
  await connectUserDB();

  // Connect delivery service database and make it available to the app
  const deliveryDBConn = await connectDeliveryDB();
  app.set("deliveryDB", deliveryDBConn); // this is now accessible anywhere in the app

  // Routes
  app.use("/api/auth", authRoutes);

  // Protected admin-only route example
  const { authenticate, authorizeRoles } = require("./middleware/authMiddleware");
  app.get("/api/admin", authenticate, authorizeRoles("admin"), (req, res) => {
    res.send("Welcome, Admin!");
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Auth service running on port ${PORT}`));
})();
