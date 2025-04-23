const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authenticate } = require("../middlewares/authMiddleware");

router.post("/addToCart", authenticate, cartController.addToCart);
router.put("/updateItemQuantity", authenticate, cartController.updateItemQuantity);

module.exports = router;