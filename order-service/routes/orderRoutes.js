const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticate } = require("../middlewares/authMiddleware");

router.post("/placeOrder", authenticate, orderController.placeOrder);

router.get("/my-orders", authenticate, orderController.getAllOrders);
router.get("/my-orders/:orderId", authenticate, orderController.getOrderById);

module.exports = router;
