const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");

const getJwtSecret = () => process.env.JWT_SECRET;

const generateActionToken = (payload, expiresIn) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
};

const verifyActionToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

// Generate random 8-digit verification code
const generateVerificationToken = (payload = {}) => {
  return generateActionToken(
    {
      ...payload,
      purpose: "email-verification",
    },
    "24h",
  );
};

// Generate token expiry time (24 hours from now)
const getTokenExpiry = () => {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
};

const generateAccountDeletionToken = (payload = {}) => {
  return generateActionToken(
    {
      ...payload,
      purpose: "account-deletion",
    },
    "15m",
  );
};

const verifyVerificationToken = (token) => {
  const payload = verifyActionToken(token);
  if (payload.purpose !== "email-verification") {
    throw new Error("Invalid verification token");
  }
  return payload;
};

const verifyAccountDeletionToken = (token) => {
  const payload = verifyActionToken(token);
  if (payload.purpose !== "account-deletion") {
    throw new Error("Invalid account deletion token");
  }
  return payload;
};

// Generate a secure password reset token plus its hashed storage value
const generatePasswordResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  return { resetToken, resetTokenHash };
};

// Generate password reset token expiry time (1 hour from now)
const getPasswordResetTokenExpiry = () => {
  return new Date(Date.now() + 60 * 60 * 1000);
};

const getJwtRefreshSecret = () => process.env.JWT_REFRESH_SECRET;

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, getJwtRefreshSecret(), {
    expiresIn: "7d",
  });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, getJwtRefreshSecret());
};

module.exports = {
  generateVerificationToken,
  getTokenExpiry,
  generatePasswordResetToken,
  getPasswordResetTokenExpiry,
  generateAccountDeletionToken,
  verifyVerificationToken,
  verifyAccountDeletionToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};
