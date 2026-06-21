const express = require("express");
const {
  updateProfile,
  getUserProfile,
  getMyProfile,
  getProfileStatus,
  updateProfileVisibility,
  discoverProfiles,
  uploadProfilePicture,
  uploadResume,
  requestAccountDeletion,
  confirmAccountDeletion,
  followUser,
  unfollowUser,
  removeFollower,
} = require("../controllers/profileController");
const protect = require("../middleware/auth");
const multer = require("multer");

// Use memory storage — files go straight to Cloudinary, never saved locally
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

const router = express.Router();

// Public routes
router.get("/discover", discoverProfiles);

// Protected routes
router.put("/update", protect, updateProfile);
router.get("/me", protect, getMyProfile);
router.get("/status", protect, getProfileStatus);
router.put("/visibility", protect, updateProfileVisibility);
router.post(
  "/upload-picture",
  protect,
  upload.single("profilePicture"),
  uploadProfilePicture,
);
router.post("/upload-resume", protect, upload.single("resume"), uploadResume);

// Account deletion routes
router.post("/request-delete", protect, requestAccountDeletion);
router.delete("/delete", protect, confirmAccountDeletion);

// Follow/Unfollow routes
router.post("/:userIdOrUsername/follow", protect, followUser);
router.post("/:userIdOrUsername/unfollow", protect, unfollowUser);
router.post("/:userIdOrUsername/remove-follower", protect, removeFollower);

// Public route (keep last to avoid catching static paths)
router.get("/:userId", getUserProfile);

module.exports = router;
