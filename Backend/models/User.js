const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores, and no spaces"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpire: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpire: {
      type: Date,
      default: null,
    },
    deleteAccountOtp: {
      type: String,
      default: null,
    },
    deleteAccountOtpExpire: {
      type: Date,
      default: null,
    },
    // Profile fields
    profilePicture: {
      type: String,
      default: null,
    },
    profilePicturePublicId: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot be more than 500 characters"],
      default: "",
    },
    location: {
      type: String,
      maxlength: [100, "Location cannot be more than 100 characters"],
      default: "",
    },
    resume: {
      type: String,
      default: null,
    },
    resumePublicId: {
      type: String,
      default: null,
    },
    availability: {
      type: String,
      enum: ["not available", "part-time", "full-time"],
      default: "not available",
    },
    education: [
      {
        school: { type: String },
        degree: { type: String },
        from: { type: String },
        to: { type: String },
        isCurrentlyStudying: { type: Boolean, default: false },
      },
    ],
    experience: [
      {
        company: { type: String },
        role: { type: String },
        from: { type: String },
        to: { type: String },
      },
    ],
    yearsOfExperience: {
      type: Number,
      min: [0, "Years of experience cannot be negative"],
      max: [60, "Years of experience cannot be more than 60"],
      default: 0,
    },
    currentRole: {
      type: String,
      maxlength: [100, "Current role cannot be more than 100 characters"],
      default: "",
    },
    company: {
      type: String,
      maxlength: [100, "Company cannot be more than 100 characters"],
      default: "",
    },
    skills: [
      {
        type: String,
        maxlength: [50, "Skill cannot be more than 50 characters"],
      },
    ],
    githubUrl: {
      type: String,
      maxlength: [300, "GitHub URL cannot be more than 300 characters"],
      default: "",
    },
    linkedinUrl: {
      type: String,
      maxlength: [300, "LinkedIn URL cannot be more than 300 characters"],
      default: "",
    },
    portfolioUrl: {
      type: String,
      maxlength: [300, "Portfolio URL cannot be more than 300 characters"],
      default: "",
    },
    profileComplete: {
      type: Boolean,
      default: false,
    },
    profileVisibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
