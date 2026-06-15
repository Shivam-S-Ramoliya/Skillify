const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require("../utils/emailService");
const {
  generateVerificationToken,
  generatePasswordResetToken,
  getPasswordResetTokenExpiry,
  verifyVerificationToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/tokenGenerator");

// Send token response with HttpOnly cookies and server-side storage
const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save/track refresh token on the server side
  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  const isProd = process.env.NODE_ENV === "production";

  // Access Token Cookie
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Refresh Token Cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(statusCode).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      profileComplete: user.profileComplete,
    },
  });
};

// @desc    Register a new user (Signup)
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, location } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (!location || location.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide your location",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken({
      email,
    });

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      location,
      emailVerificationToken: verificationToken,
      emailVerificationExpire: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, name);
    } catch (emailError) {
      console.error("Verification email send failed:", emailError);
      // If email sending fails, still allow signup but user needs to resend verification
      console.error("Email sending failed:", emailError);
    }

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email to verify your account.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        profileComplete: user.profileComplete,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    if (error?.name === "ValidationError") {
      const firstError = Object.values(error.errors || {})[0];
      return res.status(400).json({
        success: false,
        message: firstError?.message || "Invalid signup data",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Server error during signup",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Set cookies and return user response
    await sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error during login",
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Verify email address
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    let payload;
    try {
      payload = verifyVerificationToken(token);
    } catch (tokenError) {
      console.error("Verification token validation failed:", tokenError);
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    const user = await User.findOne({ email: payload.email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Update user
    user.isVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpire = null;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error("Welcome email sending failed:", emailError);
    }

    // Set cookies and return user response
    await sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error during email verification",
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken({
      email: user.email,
    });

    // Save to user document
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, user.name);
    } catch (emailError) {
      console.error("Verification email resend failed:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      });
    }

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Check if user's email is verified (and log them in if so)
// @route   POST /api/auth/check-verification
// @access  Public
exports.checkVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Email is not verified yet. Please check your inbox and click the verification link.",
      });
    }

    // Set cookies and return user response
    await sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Request password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists for that email, a password reset link has been sent.",
      });
    }

    const { resetToken, resetTokenHash } = generatePasswordResetToken();
    const resetTokenExpire = getPasswordResetTokenExpiry();

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpire = resetTokenExpire;
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (emailError) {
      console.error("Password reset email send failed:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "If an account exists for that email, a password reset link has been sent.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error while requesting password reset",
    });
  }
};

// @desc    Reset password using secure token
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Token, password, and confirmation password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token",
      });
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpire = null;
    await user.save();

    // Set cookies and return user response
    await sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error while resetting password",
    });
  }
};

// @desc    Log user out / clear cookies & invalidate token
// @route   POST /api/auth/logout
// @access  Public
exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      // Invalidate refresh token on server-side
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    // Clear cookies
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error during logout",
    });
  }
};

// @desc    Refresh Access Token using Refresh Token
// @route   POST /api/auth/refresh
// @access  Public
exports.refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    // Verify token exists on the server side
    const dbToken = await RefreshToken.findOne({ token: refreshToken });
    if (!dbToken) {
      const isProd = process.env.NODE_ENV === "production";
      res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
      });
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
      });
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Verify expiration of the stored token
    if (dbToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: dbToken._id });
      const isProd = process.env.NODE_ENV === "production";
      res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
      });
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
      });
      return res.status(401).json({
        success: false,
        message: "Refresh token has expired",
      });
    }

    // Verify JWT signature
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      // Signature is invalid
      await RefreshToken.deleteOne({ _id: dbToken._id });
      const isProd = process.env.NODE_ENV === "production";
      res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
      });
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
      });
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token signature",
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded.id);

    // Refresh Token Rotation
    const newRefreshToken = generateRefreshToken(decoded.id);

    // Update database with the new refresh token
    dbToken.token = newRefreshToken;
    dbToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Reset expiry
    await dbToken.save();

    const isProd = process.env.NODE_ENV === "production";

    // Set cookies
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error during token refresh",
    });
  }
};
