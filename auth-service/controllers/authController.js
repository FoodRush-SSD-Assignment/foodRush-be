const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

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
    role, // Must be: restaurantOwner | deliveryPerson | admin
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
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });

    if (user.verificationCode !== code)
      return res.status(400).json({ message: "Invalid verification code" });

    if (Date.now() > user.codeExpiresAt)
      return res.status(400).json({ message: "Verification code expired" });

    user.isVerified = true;
    user.verificationCode = null;
    user.codeExpiresAt = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isVerified)
      return res.status(403).json({ message: "Verify email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
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
