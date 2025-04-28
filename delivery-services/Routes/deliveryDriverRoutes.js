// routes/deliveryDriverRoutes.js
const express = require("express");
const router = express.Router();
const authorizeRoles = require("../middleware/authMiddleware").authorizeRoles;
const authenticate = require("../middleware/authMiddleware").authenticate;
const {
  getDeliveryDriverByUserId,
  updateDeliveryDriverByUserId,
  updateApprovalStatus,
  updateIsActiveStatus,
  deleteDeliveryDriver,
  getAllDeliveryDrivers,
} = require("../controllers/deliveryDriverController");

router.get("/admin/drivers", authenticate, getAllDeliveryDrivers);
router.get("/:userId", authenticate, getDeliveryDriverByUserId);
router.put("/:userId", authenticate, updateDeliveryDriverByUserId);
// router.put("/approve/:userId", updateApprovalStatus);
router.put("/:userId/isactive", updateIsActiveStatus);
router.delete(
  "/:userId",
  authenticate,
  authorizeRoles("admin"),
  deleteDeliveryDriver
);
router.put(
  "/approve/:userId",
  authenticate,
  authorizeRoles("admin"),
  updateApprovalStatus
);

module.exports = router;
