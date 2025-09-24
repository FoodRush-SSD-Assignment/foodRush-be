const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { connectDeliveryDB } = require("../config/db"); // import DB connection
const DeliveryDriverModel = require("../models/Driver");
const logger = require("../utils/logger");

// Utility to send email
const sendVerificationEmail = async (to, code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"FoodRush" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your FoodRush account",
    html: `<p>Your verification code is <strong>${code}</strong></p>`,
  });
};

// Customer Register
exports.customerRegister = async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    password,
    address,
    mobileno,
    dateofbirth,
    nic,
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn("Registration attempt with existing email", {
        email,
        ip: req.ip,
      });
      return res.status(400).json({ message: "Email already in use" });
    }
    logger.info("New user registered", { email, tempId: user._id, ip: req.ip });
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      address,
      mobileno,
      dateofbirth,
      nic,
      role: "customer",
      verificationCode,
      codeExpiresAt: Date.now() + 10 * 60 * 1000,
    });

    await user.save();
    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({ message: "Verification code sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//Merhcnat registration
exports.merchantRegister = async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    password,
    address,
    mobileno,
    dateofbirth,
    nic,
    role,
  } = req.body;

  if (!["restaurantOwner", "deliveryPerson", "admin"].includes(role)) {
    return res
      .status(400)
      .json({ message: "Invalid role for merchant registration" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      address,
      mobileno,
      dateofbirth,
      nic,
      role,
      verificationCode,
      codeExpiresAt: Date.now() + 10 * 60 * 1000,
    });

    await user.save();
    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({ message: "Verification code sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify Code
exports.verifyEmailCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Verify-code attempt for non-existent user", {
        email,
        ip: req.ip,
      });
    }
    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });

    if (user.verificationCode !== code) {
      logger.warn("Invalid verification code attempt", {
        email,
        ip: req.ip,
        attemptedCode: code,
      });
    } else {
      logger.info("Email verified successfully", {
        userId: user._id,
        email,
        ip: req.ip,
      });
    }
    if (Date.now() > user.codeExpiresAt)
      return res.status(400).json({ message: "Verification code expired" });

    user.isVerified = true;
    user.isActive = true; // Activate account
    user.verificationCode = null;
    user.codeExpiresAt = null;
    await user.save();

    // Only if role is deliveryPerson, create driver record
    if (user.role === "deliveryPerson") {
      const deliveryConn = await connectDeliveryDB();
      const DeliveryDriver = DeliveryDriverModel(deliveryConn);

      await DeliveryDriver.create({
        userId: user._id,
        driverName: `${user.firstname} ${user.lastname}`,
        phone: user.mobileno,
        email: user.email,
        vehicle: null,
        isActive: true,
        vehicleNumber: null,
        currentLocation: { lat: null, lng: null },
        status: "inactive",
        approvalStatus: "registered",
      });
    }
    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Resend Verification Code
exports.resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newCode;
    user.codeExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendVerificationEmail(email, newCode);

    res.status(200).json({ message: "Verification code resent" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Login failed - user not found", { email, ip: req.ip });
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.isVerified)
      return res
        .status(403)
        .json({ message: "Please verify your email first." });

    if (!user.isActive)
      return res.status(403).json({
        message:
          "This account has been deactivated. Contact support if needed.",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn("Login failed - invalid password", {
        email,
        ip: req.ip,
        userId: user._id,
      });
      return res.status(400).json({ message: "Invalid credentials" });
    }
    logger.info("Login success", {
      userId: user._id,
      email: user.email,
      ip: req.ip,
    });

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        email: user.email,

        role: user.role,
        redirectTo: user.role === "customer" ? "landing" : "dashboard",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.status(200).json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
};

//get users by id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: err.message });
  }
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
  const { role } = req.params;

  // Validate role
  const validRoles = ["admin", "customer", "restaurantOwner", "deliveryPerson"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const users = await User.find({ role }).select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching users by role",
      error: err.message,
    });
  }
};

//deactivate account
exports.deactivateAccount = async (req, res) => {
  try {
    const userId = req.user.userId; // from authenticated token
    await User.findByIdAndUpdate(userId, { isActive: false });
    res.status(200).json({ message: "Account deactivated successfully." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deactivating account", error: err.message });
  }
};

//delete user
exports.adminDeleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    logger.info("Admin deleted user", {
      adminId: req.user.userId,
      deletedUserId: userId,
      ip: req.ip,
    });
    res.status(200).json({ message: "User deleted permanently by admin." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
  }
};

//update user details
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Allow only self or admin
    if (req.user.userId !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const updated = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    }).select("-password");

    res.status(200).json(updated);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating user", error: err.message });
  }
};

// Verify user's current password
exports.verifyPassword = async (req, res) => {
  try {
    const userId = req.user.userId; // from authenticated token
    const { password } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    res
      .status(200)
      .json({ valid: true, message: "Password verified successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error verifying password", error: error.message });
  }
};
