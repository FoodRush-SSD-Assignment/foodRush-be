const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.post("/placeOrder", authenticate, orderController.placeOrder);

router.get("/my-orders", authenticate, orderController.getCurrentOrders);
router.get("/order-history", authenticate, orderController.getAllOrders);
router.get("/my-orders/:orderId", authenticate, orderController.getOrderById);

router.get(
  "/admin/all-orders",
  authenticate,
  authorizeRoles("admin"),
  orderController.getAllOrdersForAdmin
);
router.get(
  "/driver/all-orders",
  authenticate,
  authorizeRoles("deliveryPerson"),
  orderController.getAllOrdersForDriver
);

router.put("/updateOrder/:orderId", authenticate, orderController.updateOrder);
router.patch("/hide/:orderId", authenticate, orderController.hideOrder);
router.patch("/unhide/:orderId", authenticate, orderController.unhideOrder);
router.patch(
  "/cancel/:orderId",
  authenticate,
  orderController.cancelOrderByCustomer
);

//get order only for specific restaurant
router.get(
  "/restaurant/:restaurantId",
  authenticate,
  orderController.getOrdersByRestaurant
);


module.exports = router;
