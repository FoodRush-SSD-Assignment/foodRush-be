let db2; // to be initialized in index.js

// This function will be exported to set db2 from outside
function setOrderDb(database) {
  db2 = database;
}

const getOrders = async (req, res) => {
  try {
    const orders = await db2.collection("orders").find({}).toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders", details: err });
  }
};

module.exports = { getOrders, setOrderDb };
