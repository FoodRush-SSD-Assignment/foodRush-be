const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);

// Test protected route
const { authenticate, authorizeRoles } = require("./middleware/authMiddleware");
app.get("/api/admin", authenticate, authorizeRoles("admin"), (req, res) => {
  res.send("Welcome, Admin!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));
