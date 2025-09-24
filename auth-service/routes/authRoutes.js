const express = require("express");
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs:  15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: "Too many login attempts. Please try again later." }
});

const {
  customerRegister,
  merchantRegister,
  verifyEmailCode,
  login,
  getAllUsers,
  getUserById,
  resendVerificationCode,
  getUsersByRole,
  deactivateAccount,
  adminDeleteUser,
  updateUser,
  verifyPassword,
} = require("../controllers/authController");
const authorizeRoles = require("../middleware/authMiddleware").authorizeRoles;
const authenticate = require("../middleware/authMiddleware").authenticate;
const router = express.Router();

router.post("/customer-register", customerRegister);
router.post("/merchant-register", merchantRegister);
router.post("/verify-email", verifyEmailCode);
router.post("/resend-code", resendVerificationCode);
router.post("/login", loginLimiter, login);
router.get("/getuser/:id", authenticate, getUserById);
router.put("/update/:id", authenticate, updateUser);
router.put("/deactivate", authenticate, deactivateAccount);
router.post("/verify-password", authenticate, verifyPassword);

//admin only
router.get("/getusers", authenticate, authorizeRoles("admin"), getAllUsers);
router.get(
  "/getusers/role/:role",
  authenticate,
  authorizeRoles("admin"),
  getUsersByRole
);
router.delete(
  "/delete/:id",
  authenticate,
  authorizeRoles("admin"),
  adminDeleteUser
); // admin deletes

module.exports = router;
