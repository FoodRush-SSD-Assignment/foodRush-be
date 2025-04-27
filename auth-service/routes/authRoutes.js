const express = require("express");
const {
  customerRegister,
  merchantRegister,
  verifyEmailCode,
  login,
  getAllUsers,
  getUserById,
  resendVerificationCode,
} = require("../controllers/authController");
const authorizeRoles = require("../middleware/authMiddleware").authorizeRoles;
const authenticate = require("../middleware/authMiddleware").authenticate;
const router = express.Router();

router.post("/customer-register", customerRegister);
router.post("/merchant-register", merchantRegister);
router.post("/verify-email", verifyEmailCode);
router.post("/resend-code", resendVerificationCode);
router.post("/login", login);
router.get("/getuser/:id", getUserById);
//admin only
router.get("/getusers", authenticate, authorizeRoles("admin"), getAllUsers);

module.exports = router;
