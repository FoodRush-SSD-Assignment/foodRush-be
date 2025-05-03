const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authenticate } = require("../middlewares/authMiddleware");

router.post("/addToCart", authenticate, cartController.addToCart);
router.put("/updateItemQuantity", authenticate, cartController.updateItemQuantity);
router.get("/getCart", authenticate, cartController.getCartItems);
router.delete("/deleteItem", authenticate, cartController.deleteItemFromCart);

module.exports = router;