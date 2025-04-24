const express = require("express");
const {
  customerRegister,
  merchantRegister,
  verifyEmailCode,
  login,
  getAllUsers,
  getUserById,
  resendVerificationCode,  getUsersByRole, deactivateAccount,
  adminDeleteUser,
  updateUser,
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
router.put("/update/:id", authenticate, updateUser); 
router.put("/deactivate", authenticate, deactivateAccount); 

//admin only
router.get("/getusers", authenticate, authorizeRoles("admin"), getAllUsers);
router.get("/getusers/role/:role", authenticate, authorizeRoles("admin"), getUsersByRole);
router.delete("/delete/:id", authenticate, authorizeRoles("admin"), adminDeleteUser); // admin deletes

module.exports = router;
