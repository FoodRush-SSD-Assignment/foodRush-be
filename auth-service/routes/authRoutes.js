const express = require("express");
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
  googleAuth,
  googleAuthCallback,
  googleAuthSuccess,
  getCurrentUser,
} = require("../controllers/authController");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/customer-register", customerRegister);
router.post("/merchant-register", merchantRegister);
router.post("/verify-email", verifyEmailCode);
router.post("/resend-code", resendVerificationCode);
router.post("/login", login);
router.get("/getuser/:id", authenticate, getUserById);
router.get("/getuser/me", authenticate, getCurrentUser);
router.get("/getusers", authenticate, authorizeRoles("admin"), getAllUsers);
router.put("/update/:id", authenticate, updateUser);
router.put("/deactivate", authenticate, deactivateAccount);
router.post("/verify-password", authenticate, verifyPassword);

// Google OAuth routes
router.get("/google", googleAuth);
router.get("/google/callback", googleAuthCallback);
router.get("/google/success", googleAuthSuccess);

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
