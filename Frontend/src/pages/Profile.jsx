import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../utils/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Skeleton from "../components/common/Skeleton";
import EditProfileForm from "../components/profile/EditProfileForm";
import DeleteAccountModal from "../components/profile/DeleteAccountModal";
import { setPageTitle, resetPageTitle } from "../utils/pageTitle";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  MapPin,
  Edit2,
  EyeOff,
  Eye,
  User,
  Briefcase,
  GraduationCap,
  GitBranch,
  Link2,
  Globe,
  FileText,
  Trash2,
  X,
  Mail,
  Calendar,
} from "lucide-react";

const pageVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, duration: 0.5, ease: "easeOut" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 15 },
  },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  if (dateStr === "Present") return "Present";
  const parts = dateStr.split("-");
  if (parts.length !== 2) return dateStr;
  return `${parts[1]}/${parts[0]}`;
};

const formatDateRange = (fromDate, toDate, isCurrently = false) => {
  const from = formatDate(fromDate);
  if (isCurrently) {
    return `${from} - Current`;
  }
  const to = formatDate(toDate);
  return `${from} - ${to}`;
};

export default function Profile() {
  const { userId, username, usernameOrId } = useParams();
  const { user: currentUser, updateUser, refreshUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'followers' | 'following' | null

  const currentUserId = currentUser?._id || currentUser?.id;
  const param = usernameOrId || userId || username;
  const isOwnProfile =
    !param ||
    param === currentUserId ||
    (currentUser?.username && param.toLowerCase() === currentUser.username.toLowerCase());

  useEffect(() => {
    if (profile) setPageTitle(`${profile.name} | Skillify`);
    return () => resetPageTitle();
  }, [profile]);

  useEffect(() => {
    fetchProfile();
  }, [userId, username, usernameOrId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await (isOwnProfile
        ? api.getMyProfile()
        : api.getUserProfile(param));
      if (response.success) {
        const profileData = response.data || response.user;
        setProfile(profileData);
      }
    } catch (err) {
      toast.error(err.message || "Could not load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFollowing = profile?.followers?.some(
    (f) =>
      (f._id || f) === currentUserId ||
      (f.username && currentUser?.username && f.username.toLowerCase() === currentUser.username.toLowerCase())
  );

  const handleFollowToggle = async () => {
    try {
      const response = await (isFollowing
        ? api.unfollowUser(profile.username || profile._id)
        : api.followUser(profile.username || profile._id));
      if (response.success) {
        toast.success(response.message);
        fetchProfile();
      }
    } catch (err) {
      toast.error(err.message || "Could not update follow status. Please try again.");
    }
  };

  const handleEditSave = (response) => {
    const updatedUser = response.user;
    const oldUsername = profile?.username;

    setProfile(updatedUser);
    updateUser(updatedUser);
    setEditing(false);

    if (updatedUser?.username && updatedUser.username !== oldUsername) {
      navigate(`/profile/${updatedUser.username}`, { replace: true });
    }
  };

  const handleModalFollowToggle = async (targetUser) => {
    const isFollowingTarget = currentUser?.following?.some(
      (f) => String(f._id || f) === String(targetUser._id)
    );
    try {
      const response = await (isFollowingTarget
        ? api.unfollowUser(targetUser.username || targetUser._id)
        : api.followUser(targetUser.username || targetUser._id));
      if (response.success) {
        toast.success(response.message);
        await refreshUser();
        await fetchProfile();
      }
    } catch (err) {
      toast.error(err.message || "Could not update follow status. Please try again.");
    }
  };

  const handleModalRemoveFollower = async (targetUser) => {
    try {
      const response = await api.removeFollower(targetUser.username || targetUser._id);
      if (response.success) {
        toast.success(response.message);
        await refreshUser();
        await fetchProfile();
      }
    } catch (err) {
      toast.error(err.message || "Could not remove follower. Please try again.");
    }
  };

  const toggleVisibility = async () => {
    try {
      const nextVisibility =
        profile.profileVisibility === "public" ? "private" : "public";
      const response = await api.updateProfileVisibility(nextVisibility);
      if (response.success) {
        const updated = {
          ...profile,
          profileVisibility: response.profileVisibility,
        };
        setProfile(updated);
        updateUser({
          ...currentUser,
          profileVisibility: response.profileVisibility,
        });
        toast.success(`Profile is now ${response.profileVisibility === "public" ? "visible to everyone" : "hidden from discovery"}.`);
      }
    } catch (err) {
      const message = err.message || "Failed to update visibility";
      if (
        message.includes("open posted jobs") ||
        message.includes("pending applications")
      ) {
        toast.warning(message);
      } else {
        toast.error(message);
      }
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen pb-24 animate-pulse">
        <div className="page-container space-y-8 relative z-10 pt-[80px]">
          {/* Main profile card (centered) */}
          <div className="bg-surface border border-secondary/15 rounded-2xl shadow-sm">
            <div className="px-5 md:px-12 py-8 md:py-12 relative flex flex-col items-center justify-center text-center">
              <Skeleton className="h-28 w-28 md:h-44 md:w-44 rounded-2xl mb-6" />
              <div className="mt-2 w-full max-w-3xl mx-auto flex flex-col items-center space-y-3">
                <Skeleton className="h-8 md:h-10 w-48 md:w-64 rounded-lg" />
                <Skeleton className="h-5 w-32 rounded-lg" />
                <Skeleton className="h-6 w-48 rounded-lg" />
                
                {/* Followers/Following statistics buttons */}
                <div className="flex items-center justify-center gap-3 md:gap-6 mt-5 md:mt-6">
                  <Skeleton className="h-10 w-28 rounded-xl" />
                  <Skeleton className="h-10 w-28 rounded-xl" />
                </div>
                
                {/* Location, email, joined date details */}
                <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-2 md:gap-4 mt-5 md:mt-6">
                  <Skeleton className="h-8 w-36 rounded-lg" />
                  <Skeleton className="h-8 w-48 rounded-lg" />
                  <Skeleton className="h-8 w-40 rounded-lg" />
                </div>

                {/* Edit/visibility buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 md:gap-4 mt-8 md:mt-10 w-full pt-6 md:pt-8 border-t border-secondary/15 max-w-2xl">
                  <Skeleton className="h-11 w-36 rounded-lg" />
                  <Skeleton className="h-11 w-36 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* About section card */}
          <div className="bg-surface border border-secondary/15 rounded-2xl p-5 md:p-10 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-secondary/10 pb-5">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-8 w-32 rounded-lg" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-wrap relative flex items-center justify-center min-h-[60vh]">
        <div className="rounded-2xl border border-error-250 bg-error-50/90 backdrop-blur-md px-8 py-6 text-error-700 flex flex-col items-center gap-4 font-bold shadow-lg text-center max-w-md">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mb-2">
            <AlertCircle className="w-8 h-8 text-error-500 shrink-0" />
          </div>
          <p className="text-xl">Unable to load profile.</p>
          {isOwnProfile && (
            <button
              onClick={fetchProfile}
              className="mt-4 btn-primary bg-error-500 hover:bg-error-600 shadow-error-500/30"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-24">


      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="page-container space-y-8 relative z-10 pt-[80px]"
      >
        <motion.section
          variants={itemVariants}
          className="bg-surface border border-secondary/15 rounded-2xl shadow-sm transition-all duration-300"
        >
          <div className="px-5 md:px-12 py-8 md:py-12 relative">
            <div className="flex flex-col items-center justify-center text-center relative z-10 w-full">
              {profile.profilePicture ? (
                <motion.div
                  initial={{ scale: 0.8, rotate: -3 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 120 }}
                  className="relative shrink-0 group mb-6"
                >
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="h-28 w-28 md:h-44 md:w-44 rounded-2xl border-4 border-surface object-cover shadow-md relative z-10"
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, rotate: -3 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 120 }}
                  className="relative shrink-0 group mb-6"
                >
                  <div className="flex h-28 w-28 md:h-44 md:w-44 items-center justify-center rounded-2xl border-4 border-surface text-5xl md:text-7xl font-black text-white bg-tertiary shadow-md relative z-10">
                    {profile.name?.charAt(0)?.toUpperCase()}
                  </div>
                </motion.div>
              )}

              <div className="mt-2 w-full max-w-3xl mx-auto flex flex-col items-center">
                <h1 className="text-2xl md:text-5xl font-extrabold tracking-tight text-primary">
                  {profile.name}
                </h1>

                {profile.username && (
                  <p className="text-base md:text-lg font-bold text-secondary/70 mt-1">
                    @{profile.username}
                  </p>
                )}

                {(profile.currentRole || profile.company) && (
                  <p className="text-base md:text-xl font-bold mt-2 md:mt-3 text-tertiary">
                    {[profile.currentRole, profile.company]
                      .filter(Boolean)
                      .join(" at ")}
                  </p>
                )}

                {/* Followers & Following Stats */}
                <div className="flex items-center justify-center gap-3 md:gap-6 mt-5 md:mt-6">
                  <button
                    onClick={() => setActiveModal("followers")}
                    className="text-sm font-bold flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-secondary/15 text-secondary shadow-sm hover:border-tertiary transition-all cursor-pointer"
                  >
                    <span className="text-base font-extrabold text-tertiary">
                      {profile.followers?.length || 0}
                    </span>{" "}
                    followers
                  </button>
                  <button
                    onClick={() => setActiveModal("following")}
                    className="text-sm font-bold flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-secondary/15 text-secondary shadow-sm hover:border-tertiary transition-all cursor-pointer"
                  >
                    <span className="text-base font-extrabold text-tertiary">
                      {profile.following?.length || 0}
                    </span>{" "}
                    following
                  </button>
                </div>

                {!isOwnProfile && (() => {
                  const profileFollowsYou = profile.following?.some(
                    (f) => String(f._id || f) === String(currentUserId)
                  ) || currentUser?.followers?.some(
                    (id) => String(id._id || id) === String(profile._id)
                  );
                  return (
                    <div className="mt-6 flex flex-col items-center gap-2 w-full">
                      {profileFollowsYou ? (
                        <span className="text-[11px] bg-emerald-500/10 text-emerald-600 font-bold px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-sm">
                          Follows you
                        </span>
                      ) : (
                        <span className="text-[11px] bg-secondary/10 text-secondary font-bold px-2.5 py-1 rounded-full border border-secondary/15 shadow-sm">
                          Not follows you
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleFollowToggle}
                        className={`py-2.5 px-8 text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer ${
                          isFollowing
                            ? "bg-secondary/10 text-primary border border-secondary/35 hover:bg-secondary/20"
                            : "btn-primary"
                        }`}
                      >
                        {isFollowing ? "Unfollow" : "Follow"}
                      </button>
                    </div>
                  );
                })()}

                <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-2 md:gap-4 mt-5 md:mt-6">
                  {profile.location && (
                    <span className="text-sm font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-secondary/15 text-secondary shadow-sm">
                      <MapPin className="w-4 h-4 text-tertiary" />
                      {profile.location}
                    </span>
                  )}
                  {profile.email && (
                    <span className="text-sm font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-secondary/15 text-secondary shadow-sm">
                      <Mail className="w-4 h-4 text-tertiary" />
                      {profile.email}
                    </span>
                  )}
                  <span className="text-sm font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-secondary/15 text-secondary shadow-sm">
                    <Calendar className="w-4 h-4 text-tertiary" />
                    Joined{" "}
                    {new Date(
                      profile.createdAt || Date.now(),
                    ).toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {isOwnProfile && (
                <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 md:gap-4 mt-8 md:mt-10 w-full pt-6 md:pt-8 border-t border-secondary/15 max-w-2xl mx-auto">
                  <button
                    type="button"
                    onClick={() => setEditing((prev) => !prev)}
                    className="btn-primary py-2.5 px-6 flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    {editing ? (
                      <>
                        <X className="w-4 h-4" /> Cancel Edit
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-4 h-4" /> Edit Profile
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={toggleVisibility}
                    className="btn-secondary py-2.5 px-6 flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    {profile.profileVisibility === "public" ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Make Private
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 text-success-700" />
                        Make Public
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        <AnimatePresence mode="wait">
          {editing && isOwnProfile ? (
            <motion.section
              key="editing"
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              className="bg-surface border border-secondary/15 rounded-2xl p-5 md:p-12 shadow-sm"
            >
              <div className="max-w-4xl mx-auto">
                <EditProfileForm
                  initialData={profile}
                  onSave={handleEditSave}
                  onCancel={() => setEditing(false)}
                  submitLabel="Save Changes"
                />
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="viewing"
              variants={itemVariants}
              className="flex flex-col gap-8"
            >
              <div className="space-y-8">
                <article className="bg-surface border border-secondary/15 rounded-2xl p-5 md:p-10 shadow-sm">
                  <h2 className="text-2xl font-extrabold flex items-center gap-3 border-b border-secondary/10 pb-5 mb-6 text-primary">
                    <div className="p-2.5 rounded-lg bg-surface border border-secondary/15 text-tertiary shadow-sm">
                      <User className="w-5 h-5" />
                    </div>
                    About Me
                  </h2>
                  <p className="text-base font-medium leading-relaxed whitespace-pre-line text-secondary">
                    {profile.bio ||
                      "This user prefers to let their skills speak for themselves."}
                  </p>
                </article>

                {profile.experience && profile.experience.length > 0 && (
                  <article className="bg-surface border border-secondary/15 rounded-2xl p-5 md:p-10 shadow-sm">
                    <h2 className="text-2xl font-extrabold flex items-center gap-3 border-b border-secondary/10 pb-5 mb-6 text-primary">
                      <div className="p-2.5 rounded-lg bg-surface border border-secondary/15 text-tertiary shadow-sm">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      Experience
                    </h2>
                    <div className="space-y-6">
                      {Array.isArray(profile.experience) ? (
                        profile.experience.map((exp, idx) => (
                          <div
                            key={idx}
                            className="border-l-2 border-tertiary/30 pl-4 py-1"
                          >
                            <h3 className="text-lg font-bold text-primary">
                              {exp.role}
                            </h3>
                            <p className="text-base font-semibold text-secondary">
                              {exp.company}
                            </p>
                            <p className="text-xs font-semibold text-secondary/70 mt-1">
                              {formatDateRange(
                                exp.from,
                                exp.to,
                                exp.to === "Present",
                              )}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="whitespace-pre-line text-base font-medium leading-relaxed text-secondary">
                          {profile.experience}
                        </p>
                      )}
                    </div>
                  </article>
                )}

                {profile.education && profile.education.length > 0 && (
                  <article className="bg-surface border border-secondary/15 rounded-2xl p-5 md:p-10 shadow-sm">
                    <h2 className="text-2xl font-extrabold flex items-center gap-3 border-b border-secondary/10 pb-5 mb-6 text-primary">
                      <div className="p-2.5 rounded-lg bg-surface border border-secondary/15 text-tertiary shadow-sm">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      Education
                    </h2>
                    <div className="space-y-6">
                      {Array.isArray(profile.education) ? (
                        profile.education.map((edu, idx) => (
                          <div
                            key={idx}
                            className="border-l-2 border-tertiary/30 pl-4 py-1"
                          >
                            <h3 className="text-lg font-bold text-primary">
                              {edu.degree}
                            </h3>
                            <p className="text-base font-semibold text-secondary">
                              {edu.school}
                            </p>
                            <p className="text-xs font-semibold text-secondary/70 mt-1">
                              {formatDateRange(
                                edu.from,
                                edu.to,
                                edu.isCurrentlyStudying,
                              )}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="whitespace-pre-line text-base font-medium leading-relaxed text-secondary">
                          {profile.education}
                        </p>
                      )}
                    </div>
                  </article>
                )}
              </div>

              {/* 2x2 Grid Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. Quick Overview */}
                <motion.article
                  whileHover={{ y: -1 }}
                  className="bg-surface border border-secondary/15 rounded-2xl p-5 md:p-8 shadow-sm h-full flex flex-col"
                >
                  <h2 className="text-xl font-extrabold mb-6 border-b border-secondary/10 pb-4 text-primary flex items-center gap-2">
                    <Globe className="w-5 h-5 text-tertiary" />
                    Quick Overview
                  </h2>
                  <div className="flex flex-col gap-6 flex-grow justify-center">
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-secondary/60">
                        Availability
                      </p>
                      <p className="badge-primary font-bold text-xs uppercase w-fit">
                        {profile.availability || "Not specified"}
                      </p>
                    </div>
                    {typeof profile.yearsOfExperience === "number" && (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-secondary/60">
                          Total Experience
                        </p>
                        <p className="badge-primary font-bold text-xs uppercase w-fit">
                          {profile.yearsOfExperience}+ Years
                        </p>
                      </div>
                    )}
                  </div>
                </motion.article>

                {/* 2. Top Skills */}
                {profile.skills?.length > 0 && (
                  <motion.article
                    whileHover={{ y: -1 }}
                    className="bg-surface border border-secondary/15 rounded-2xl p-5 md:p-8 shadow-sm h-full flex flex-col"
                  >
                    <h2 className="text-xl font-extrabold mb-6 border-b border-secondary/10 pb-4 text-primary">
                      Top Skills
                    </h2>
                    <div className="flex flex-wrap gap-2.5">
                      {profile.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="badge-neutral text-sm py-1.5 px-3"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </motion.article>
                )}

                {/* 3. Links & Social */}
                {(profile.githubUrl ||
                  profile.linkedinUrl ||
                  profile.portfolioUrl) && (
                  <motion.article
                    whileHover={{ y: -1 }}
                    className="bg-surface border border-secondary/15 rounded-2xl p-5 md:p-8 shadow-sm h-full flex flex-col"
                  >
                    <h2 className="text-xl font-extrabold mb-6 border-b border-secondary/10 pb-4 text-primary">
                      Links & Social
                    </h2>
                    <div className="flex flex-col gap-3 flex-grow justify-center animate-fade-in">
                      {profile.githubUrl && (
                        <a
                          href={profile.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-4 p-3 rounded-xl border border-secondary/15 bg-surface shadow-sm hover:border-tertiary/30 hover:shadow-md transition-all duration-200 font-bold text-sm text-primary group"
                        >
                          <div className="p-2 rounded-lg bg-secondary/5 border border-secondary/10">
                            <GitBranch className="w-5 h-5 text-secondary group-hover:text-tertiary" />
                          </div>
                          GitHub Profile
                        </a>
                      )}
                      {profile.linkedinUrl && (
                        <a
                          href={profile.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-4 p-3 rounded-xl border border-secondary/15 bg-surface shadow-sm hover:border-tertiary/30 hover:shadow-md transition-all duration-200 font-bold text-sm text-primary group"
                        >
                          <div className="p-2 rounded-lg bg-secondary/5 border border-secondary/10">
                            <Link2 className="w-5 h-5 text-secondary group-hover:text-tertiary" />
                          </div>
                          LinkedIn Profile
                        </a>
                      )}
                      {profile.portfolioUrl && (
                        <a
                          href={profile.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-4 p-3 rounded-xl border border-secondary/15 bg-surface shadow-sm hover:border-tertiary/30 hover:shadow-md transition-all duration-200 font-bold text-sm text-primary group"
                        >
                          <div className="p-2 rounded-lg bg-secondary/5 border border-secondary/10">
                            <Globe className="w-5 h-5 text-secondary group-hover:text-tertiary" />
                          </div>
                          Personal Portfolio
                        </a>
                      )}
                    </div>
                  </motion.article>
                )}

                {/* 4. Resume */}
                {profile.resume && (
                  <motion.article
                    whileHover={{ y: -1 }}
                    className="bg-surface border border-secondary/15 rounded-2xl p-5 md:p-8 shadow-sm h-full flex flex-col justify-center"
                  >
                    <h2 className="text-xl font-extrabold mb-6 border-b border-secondary/10 pb-4 flex items-center gap-2 text-primary">
                      <FileText className="w-5 h-5 text-error-700" />
                      Resume
                    </h2>
                    <a
                      href={profile.resume}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-danger w-full py-3 text-center text-sm"
                    >
                      View / Download Resume
                    </a>
                  </motion.article>
                )}
              </div>

              {/* Danger Zone - full width outside grid */}
              {isOwnProfile && !editing && (
                <div className="mt-4">
                  <motion.article
                    whileHover={{ y: -1 }}
                    className="bg-surface border border-error-500/20 rounded-2xl p-5 md:p-8 shadow-sm flex flex-col justify-center"
                  >
                    <h2 className="text-xl font-extrabold flex items-center gap-3 border-b border-secondary/10 pb-5 mb-5 text-error-700">
                      <div className="p-2 rounded-lg bg-error-50 text-error-700">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      Danger Zone
                    </h2>
                    <p className="text-sm font-semibold mb-6 leading-relaxed text-secondary">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="btn-danger w-full py-3 flex items-center justify-center gap-2 text-white shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </button>
                  </motion.article>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </motion.div>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />

      {/* Followers / Following Modal */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-secondary/15 rounded-2xl w-full max-w-[95vw] md:max-w-md shadow-xl overflow-hidden"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-secondary/10">
                <h3 className="text-lg font-bold text-primary capitalize">
                  {activeModal}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-secondary hover:text-primary transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 max-h-[350px] overflow-y-auto space-y-4">
                {activeModal === "followers" ? (
                  profile.followers && profile.followers.length > 0 ? (
                    profile.followers.map((follower) => {
                      const isMe = String(follower._id) === String(currentUserId);
                      const isFollowingUser = currentUser?.following?.some(
                        (f) => String(f._id || f) === String(follower._id)
                      );
                      const followsYou = currentUser?.followers?.some(
                        (id) => String(id._id || id) === String(follower._id)
                      );
                      return (
                        <div
                          key={follower._id}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-secondary/5 transition-colors group gap-4"
                        >
                          <Link
                            to={follower.username ? `/profile/${follower.username}` : `/profile/${follower._id}`}
                            onClick={() => setActiveModal(null)}
                            className="flex items-center gap-3 min-w-0"
                          >
                            {follower.profilePicture ? (
                              <img
                                src={follower.profilePicture}
                                alt={follower.name}
                                className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white bg-tertiary flex-shrink-0">
                                {follower.name?.charAt(0)?.toUpperCase()}
                              </div>
                            )}
                            <div className="text-left min-w-0">
                              <p className="font-bold text-primary group-hover:text-tertiary transition-colors text-sm truncate">
                                {follower.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {follower.username && (
                                  <p className="text-xs font-semibold text-secondary truncate">
                                    @{follower.username}
                                  </p>
                                )}
                                {!isMe && (
                                  followsYou ? (
                                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 font-bold px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                                      Follows you
                                    </span>
                                  ) : (
                                    <span className="text-[9px] bg-secondary/10 text-secondary font-bold px-1.5 py-0.5 rounded border border-secondary/15 whitespace-nowrap">
                                      Not follows you
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </Link>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Follow/Unfollow button if not me */}
                            {!isMe && (
                              <button
                                onClick={() => handleModalFollowToggle(follower)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                  isFollowingUser
                                    ? "bg-surface border-secondary/35 text-secondary hover:text-primary hover:border-primary"
                                    : "bg-tertiary border-tertiary text-white hover:bg-tertiary/90"
                                }`}
                              >
                                {isFollowingUser ? "Unfollow" : "Follow"}
                              </button>
                            )}

                            {/* Remove button if viewing my own followers list */}
                            {isOwnProfile && (
                              <button
                                onClick={() => handleModalRemoveFollower(follower)}
                                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-surface border border-error-250 text-error-700 hover:bg-error-50 cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-sm font-semibold text-secondary py-6">
                      No followers yet.
                    </p>
                  )
                ) : (
                  profile.following && profile.following.length > 0 ? (
                    profile.following.map((followingUser) => {
                      const isMe = String(followingUser._id) === String(currentUserId);
                      const isFollowingUser = currentUser?.following?.some(
                        (f) => String(f._id || f) === String(followingUser._id)
                      );
                      const followsYou = currentUser?.followers?.some(
                        (id) => String(id._id || id) === String(followingUser._id)
                      );
                      return (
                        <div
                          key={followingUser._id}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-secondary/5 transition-colors group gap-4"
                        >
                          <Link
                            to={followingUser.username ? `/profile/${followingUser.username}` : `/profile/${followingUser._id}`}
                            onClick={() => setActiveModal(null)}
                            className="flex items-center gap-3 min-w-0"
                          >
                            {followingUser.profilePicture ? (
                              <img
                                src={followingUser.profilePicture}
                                alt={followingUser.name}
                                className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white bg-tertiary flex-shrink-0">
                                {followingUser.name?.charAt(0)?.toUpperCase()}
                              </div>
                            )}
                            <div className="text-left min-w-0">
                              <p className="font-bold text-primary group-hover:text-tertiary transition-colors text-sm truncate">
                                {followingUser.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {followingUser.username && (
                                  <p className="text-xs font-semibold text-secondary truncate">
                                    @{followingUser.username}
                                  </p>
                                )}
                                {!isMe && (
                                  followsYou ? (
                                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 font-bold px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                                      Follows you
                                    </span>
                                  ) : (
                                    <span className="text-[9px] bg-secondary/10 text-secondary font-bold px-1.5 py-0.5 rounded border border-secondary/15 whitespace-nowrap">
                                      Not follows you
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </Link>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Unfollow button if viewing my own profile */}
                            {isOwnProfile ? (
                              <button
                                onClick={() => handleModalFollowToggle(followingUser)}
                                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-surface border border-secondary/35 text-secondary hover:text-primary hover:border-primary cursor-pointer"
                              >
                                Unfollow
                              </button>
                            ) : (
                              /* Follow/Unfollow button if viewing someone else's list and not me */
                              !isMe && (
                                <button
                                  onClick={() => handleModalFollowToggle(followingUser)}
                                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                    isFollowingUser
                                      ? "bg-surface border-secondary/35 text-secondary hover:text-primary hover:border-primary"
                                      : "bg-tertiary border-tertiary text-white hover:bg-tertiary/90"
                                  }`}
                                >
                                  {isFollowingUser ? "Unfollow" : "Follow"}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-sm font-semibold text-secondary py-6">
                      Not following anyone yet.
                    </p>
                  )
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
