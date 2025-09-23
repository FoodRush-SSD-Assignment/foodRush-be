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
  updateVehicleDetails,
  updateCurrentLocation,
} = require("../controllers/deliveryDriverController");

router.get("/admin/drivers", authenticate, authorizeRoles("admin"), getAllDeliveryDrivers);
router.get("/:userId", authenticate, getDeliveryDriverByUserId);
router.put("/:userId", authenticate, updateDeliveryDriverByUserId);
// router.put("/approve/:userId", updateApprovalStatus);
router.put("/:userId/isactive", authenticate, authorizeRoles("admin"), updateIsActiveStatus);
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
router.put("/:userId/vehicle", authenticate, updateVehicleDetails);
router.put("/:userId/location", authenticate, updateCurrentLocation);

module.exports = router;
