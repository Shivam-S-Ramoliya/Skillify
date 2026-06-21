const User = require("../models/User");
const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinaryUpload");
const {
  sendDeleteAccountOtpEmail,
  sendAccountDeletedConfirmationEmail,
} = require("../utils/emailService");
const {
  generateAccountDeletionToken,
  verifyAccountDeletionToken,
} = require("../utils/tokenGenerator");

const PRIVATE_VISIBILITY_BLOCK_MESSAGE =
  "You cannot set your profile to private while you have open posted jobs or pending applications. Close/resolve them first.";

const validatePrivateVisibilityEligibility = async (userId) => {
  const [hasOpenPostedJobs, hasPendingApplications] = await Promise.all([
    Job.exists({ postedBy: userId, status: "open" }),
    JobApplication.exists({ applicant: userId, status: "pending" }),
  ]);

  if (hasOpenPostedJobs || hasPendingApplications) {
    return {
      allowed: false,
      message: PRIVATE_VISIBILITY_BLOCK_MESSAGE,
    };
  }

  return { allowed: true };
};

// @desc    Upload Profile Picture
// @route   POST /api/profile/upload-picture
// @access  Private
exports.uploadProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    // Delete old profile picture if exists
    if (user.profilePicturePublicId) {
      await deleteFromCloudinary(user.profilePicturePublicId);
    }

    // Upload new picture directly to Cloudinary from memory
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      "profile-pictures",
      req.file.originalname,
    );

    user.profilePicture = uploadResult.url;
    user.profilePicturePublicId = uploadResult.publicId;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upload Resume
// @route   POST /api/profile/upload-resume
// @access  Private
exports.uploadResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    // Delete old resume from Cloudinary if exists
    if (user.resumePublicId) {
      await deleteFromCloudinary(user.resumePublicId, "raw");
    }

    // Upload resume directly to Cloudinary from memory
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      "resumes",
      req.file.originalname,
    );

    user.resume = uploadResult.url;
    user.resumePublicId = uploadResult.publicId;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: user.resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile/update
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate and update username if provided
    if (Object.prototype.hasOwnProperty.call(req.body, "username") && req.body.username !== user.username) {
      const username = String(req.body.username).trim();
      
      if (!username) {
        return res.status(400).json({
          success: false,
          message: "Username cannot be empty",
        });
      }

      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({
          success: false,
          message: "Username can only contain alphanumeric characters and underscores, and no spaces",
        });
      }

      const RESERVED_USERNAMES = [
        "login", "signup", "dashboard", "discover", "profile", "publish-job", "applications",
        "forgot-password", "reset-password", "verify-email", "confirm-delete", "complete-profile",
        "admin", "api", "help", "support", "settings", "null", "undefined"
      ];
      if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "This username is reserved and cannot be used",
        });
      }

      const existingUsername = await User.findOne({ username: username.toLowerCase() });
      if (existingUsername && existingUsername._id.toString() !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken",
        });
      }

      user.username = username.toLowerCase();
    }

    // Update fields if provided (allow empty strings/arrays to clear values)
    const updatableFields = [
      "name",
      "bio",
      "location",
      "profilePicture",
      "resume",
      "availability",
      "education",
      "experience",
      "yearsOfExperience",
      "currentRole",
      "company",
      "skills",
      "githubUrl",
      "linkedinUrl",
      "portfolioUrl",
      "profileVisibility",
    ];

    updatableFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        user[field] = req.body[field];
      }
    });

    if (user.profileVisibility === "private") {
      const eligibility = await validatePrivateVisibilityEligibility(
        req.user.id,
      );
      if (!eligibility.allowed) {
        return res.status(400).json({
          success: false,
          message: eligibility.message,
        });
      }
    }

    // Check if profile is complete
    const isProfileComplete = Boolean(
      user.bio &&
      user.location &&
      user.profilePicture &&
      user.availability &&
      user.availability !== "not available" &&
      user.education &&
      user.education.length > 0 &&
      (user.yearsOfExperience === 0 ||
        (user.experience && user.experience.length > 0)) &&
      user.skills &&
      user.skills.length > 0 &&
      user.githubUrl &&
      user.linkedinUrl,
    );

    user.profileComplete = isProfileComplete;

    await user.save();

    await user.populate([
      { path: "followers", select: "name username profilePicture currentRole location" },
      { path: "following", select: "name username profilePicture currentRole location" }
    ]);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profileComplete: user.profileComplete,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
        location: user.location,
        profilePicture: user.profilePicture,
        resume: user.resume,
        availability: user.availability,
        education: user.education,
        experience: user.experience,
        yearsOfExperience: user.yearsOfExperience,
        currentRole: user.currentRole,
        company: user.company,
        skills: user.skills,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        portfolioUrl: user.portfolioUrl,
        profileVisibility: user.profileVisibility,
        profileComplete: user.profileComplete,
        followers: user.followers,
        following: user.following,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error during profile update",
    });
  }
};

// @desc    Get user profile
// @route   GET /api/profile/:userId
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(userId)) {
      query = { $or: [{ _id: userId }, { username: userId.toLowerCase() }] };
    } else {
      query = { username: userId.toLowerCase() };
    }

    const user = await User.findOne(query)
      .select("-password -emailVerificationToken -emailVerificationExpire")
      .populate("followers", "name username profilePicture currentRole location")
      .populate("following", "name username profilePicture currentRole location");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if profile is private and current user is not the owner
    let requesterId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET,
        );
        requesterId = decoded.id;
      } catch (error) {
        requesterId = null;
      }
    }

    if (user.profileVisibility === "private" && String(requesterId) !== String(user._id)) {
      return res.status(403).json({
        success: false,
        message: "This profile is private",
      });
    }

    res.status(200).json({
      success: true,
      data: user.toObject(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get current user's profile
// @route   GET /api/profile/me
// @access  Private
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -emailVerificationToken -emailVerificationExpire")
      .populate("followers", "name username profilePicture currentRole location")
      .populate("following", "name username profilePicture currentRole location");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user.toObject(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Check profile completion status
// @route   GET /api/profile/status
// @access  Private
exports.getProfileStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profileData = {
      profileComplete: user.profileComplete,
      completionPercentage: calculateCompletionPercentage(user),
      missingFields: getMissingFields(user),
    };

    res.status(200).json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// Helper function to calculate profile completion percentage
function calculateCompletionPercentage(user) {
  const requiredFields = [
    "bio",
    "location",
    "profilePicture",
    "availability",
    "education",
    "experience",
    "skills",
    "githubUrl",
    "linkedinUrl",
  ];

  let completedFields = 0;

  requiredFields.forEach((field) => {
    if (field === "experience") {
      if (
        user.yearsOfExperience === 0 ||
        (user[field] && user[field].length > 0)
      )
        completedFields++;
    } else if (field === "skills" || field === "education") {
      if (user[field] && user[field].length > 0) completedFields++;
    } else {
      if (field === "availability") {
        if (user[field] && user[field] !== "not available") completedFields++;
      } else if (user[field]) {
        completedFields++;
      }
    }
  });

  return Math.round((completedFields / requiredFields.length) * 100);
}

// Helper function to get missing fields
function getMissingFields(user) {
  const missing = [];

  if (!user.bio) missing.push("bio");
  if (!user.location) missing.push("location");
  if (!user.profilePicture) missing.push("profilePicture");
  if (!user.availability || user.availability === "not available")
    missing.push("availability");
  if (!user.education || user.education.length === 0) missing.push("education");
  if (
    user.yearsOfExperience > 0 &&
    (!user.experience || user.experience.length === 0)
  )
    missing.push("experience");
  if (!user.skills || user.skills.length === 0) missing.push("skills");
  if (!user.githubUrl) missing.push("githubUrl");
  if (!user.linkedinUrl) missing.push("linkedinUrl");

  return missing;
}

// @desc    Update profile visibility
// @route   PUT /api/profile/visibility
// @access  Private
exports.updateProfileVisibility = async (req, res) => {
  try {
    const { profileVisibility } = req.body;

    if (!["public", "private"].includes(profileVisibility)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile visibility option",
      });
    }

    if (profileVisibility === "private") {
      const eligibility = await validatePrivateVisibilityEligibility(
        req.user.id,
      );
      if (!eligibility.allowed) {
        return res.status(400).json({
          success: false,
          message: eligibility.message,
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileVisibility },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Profile visibility set to ${profileVisibility}`,
      profileVisibility: user.profileVisibility,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get all public profiles (for discovery)
// @route   GET /api/profile/discover
// @access  Public
exports.discoverProfiles = async (req, res) => {
  try {
    const { role, skill, search, page = 1, limit = 10 } = req.query;

    const query = {
      profileVisibility: "public",
      profileComplete: true,
      isVerified: true,
    };

    // Optionally exclude current user if token is provided in cookies or headers
    let token = null;
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET,
        );
        if (decoded?.id) {
          query._id = { $ne: decoded.id };
        }
      } catch (error) {
        // ignore invalid token for public discover
      }
    }

    if (role) query.role = role;
    if (skill) {
      const trimmedSkill = skill.trim();
      if (trimmedSkill) {
        const regexFilter = { $regex: trimmedSkill, $options: "i" };

        query.skills = regexFilter;
      }
    }

    if (search) {
      const trimmedSearch = search.trim();
      if (trimmedSearch) {
        const regex = { $regex: trimmedSearch, $options: "i" };
        query.$or = [
          { name: regex },
          { username: regex },
          { currentRole: regex },
          { skills: regex },
          { location: regex }
        ];
      }
    }

    const startIndex = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select("-password -emailVerificationToken -emailVerificationExpire")
      .limit(parseInt(limit))
      .skip(startIndex)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Request account deletion (sends confirmation link email)
// @route   POST /api/profile/request-delete
// @access  Private
exports.requestAccountDeletion = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const deletionToken = generateAccountDeletionToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Send confirmation link email
    try {
      await sendDeleteAccountOtpEmail(user.email, deletionToken, user.name);
    } catch (emailError) {
      console.error("Failed to send deletion confirmation email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send deletion email. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "A confirmation link has been sent to your email address.",
    });
  } catch (error) {
    console.error("Request account deletion error:", error);
    res.status(500).json({
      success: false,
      message:
        error.message || "Server error while requesting account deletion",
    });
  }
};

// @desc    Confirm account deletion with token
// @route   DELETE /api/profile/delete
// @access  Private
exports.confirmAccountDeletion = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Deletion token is required",
      });
    }

    let payload;
    try {
      payload = verifyAccountDeletionToken(token);
    } catch (tokenError) {
      console.error("Deletion token validation failed:", tokenError);
      return res.status(400).json({
        success: false,
        message: "Invalid or expired deletion token",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (payload.userId && payload.userId !== user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Deletion token does not match the current account",
      });
    }

    // Token is valid — proceed with full deletion

    // 1. Delete user files from Cloudinary
    if (user.profilePicturePublicId) {
      await deleteFromCloudinary(user.profilePicturePublicId);
    }
    if (user.resumePublicId) {
      await deleteFromCloudinary(user.resumePublicId, "raw");
    }

    // 2. Find jobs posted by the user
    const userJobs = await Job.find({ postedBy: user._id });

    // For each job posted by user, delete the document attachment from cloudinary first
    for (const job of userJobs) {
      if (job.jobDescriptionDocumentPublicId) {
        await deleteFromCloudinary(job.jobDescriptionDocumentPublicId, "raw");
      }
    }

    // 3. Delete all jobs posted by the user
    await Job.deleteMany({ postedBy: user._id });

    // 4. Delete all applications related to the user (either applicant or employer)
    await JobApplication.deleteMany({
      $or: [{ applicant: user._id }, { employer: user._id }],
    });

    // 5. Send confirmation email before deleting the user so we still have their email
    await sendAccountDeletedConfirmationEmail(user.email, user.name);

    // 6. Delete the user document
    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      success: true,
      message: "Account and all associated data deleted successfully",
    });
  } catch (error) {
    console.error("Confirm account deletion error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while deleting account",
    });
  }
};

// @desc    Follow a user
// @route   POST /api/profile/:userIdOrUsername/follow
// @access  Private
exports.followUser = async (req, res) => {
  try {
    const { userIdOrUsername } = req.params;
    const currentUserId = req.user.id;

    // Find the user to follow
    let query = {};
    if (mongoose.Types.ObjectId.isValid(userIdOrUsername)) {
      query = { $or: [{ _id: userIdOrUsername }, { username: userIdOrUsername.toLowerCase() }] };
    } else {
      query = { username: userIdOrUsername.toLowerCase() };
    }

    const userToFollow = await User.findOne(query);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (userToFollow._id.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    // Add to current user's following list
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: userToFollow._id },
    });

    // Add to target user's followers list
    await User.findByIdAndUpdate(userToFollow._id, {
      $addToSet: { followers: currentUserId },
    });

    res.status(200).json({
      success: true,
      message: `Successfully followed ${userToFollow.name}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error while following user",
    });
  }
};

// @desc    Unfollow a user
// @route   POST /api/profile/:userIdOrUsername/unfollow
// @access  Private
exports.unfollowUser = async (req, res) => {
  try {
    const { userIdOrUsername } = req.params;
    const currentUserId = req.user.id;

    // Find the user to unfollow
    let query = {};
    if (mongoose.Types.ObjectId.isValid(userIdOrUsername)) {
      query = { $or: [{ _id: userIdOrUsername }, { username: userIdOrUsername.toLowerCase() }] };
    } else {
      query = { username: userIdOrUsername.toLowerCase() };
    }

    const userToUnfollow = await User.findOne(query);
    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove from current user's following list
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: userToUnfollow._id },
    });

    // Remove from target user's followers list
    await User.findByIdAndUpdate(userToUnfollow._id, {
      $pull: { followers: currentUserId },
    });

    res.status(200).json({
      success: true,
      message: `Successfully unfollowed ${userToUnfollow.name}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error while unfollowing user",
    });
  }
};

// @desc    Remove a follower (force a user to unfollow us)
// @route   POST /api/profile/:userIdOrUsername/remove-follower
// @access  Private
exports.removeFollower = async (req, res) => {
  try {
    const { userIdOrUsername } = req.params;
    const currentUserId = req.user.id;

    // Find the user to remove from followers
    let query = {};
    if (mongoose.Types.ObjectId.isValid(userIdOrUsername)) {
      query = { $or: [{ _id: userIdOrUsername }, { username: userIdOrUsername.toLowerCase() }] };
    } else {
      query = { username: userIdOrUsername.toLowerCase() };
    }

    const followerUser = await User.findOne(query);
    if (!followerUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove followerUser._id from current user's followers list
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { followers: followerUser._id },
    });

    // Remove currentUserId from followerUser's following list
    await User.findByIdAndUpdate(followerUser._id, {
      $pull: { following: currentUserId },
    });

    res.status(200).json({
      success: true,
      message: `Successfully removed ${followerUser.name} from your followers`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error while removing follower",
    });
  }
};
