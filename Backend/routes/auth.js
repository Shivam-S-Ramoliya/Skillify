const express = require("express");
const {
  signup,
  login,
  getMe,
  verifyEmail,
  resendVerification,
  checkVerification,
  forgotPassword,
  resetPassword,
  logout,
  refresh,
} = require("../controllers/authController");
const protect = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/check-verification", checkVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Protected routes
router.get("/me", protect, getMe);

module.exports = router;
