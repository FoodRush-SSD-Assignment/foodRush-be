const jwt = require("jsonwebtoken");

// Authenticate with JWT
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // payload will contain userId, role, etc.
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);

    return res.status(401).json({ message: "Invalid token" });
  }
}

// Role-based authorization
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: insufficient rights" });
    }
    next();
  };
}

module.exports = { authenticate, authorizeRoles };
