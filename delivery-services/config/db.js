const mongoose = require("mongoose");
require("dotenv").config();

const connectDBs = async () => {
  try {
    const db1 = await mongoose.createConnection(process.env.MONGO_URI1, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected to Delivery Service (DB1)");

    const db2 = await mongoose.createConnection(process.env.MONGO_URI2, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected to Order Service (DB2)");

    return { db1, db2 }; // export both connections
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDBs;
