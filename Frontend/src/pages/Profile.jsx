import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../utils/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
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
  const { userId } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const currentUserId = currentUser?._id || currentUser?.id;
  const isOwnProfile = !userId || userId === currentUserId;

  useEffect(() => {
    if (profile) setPageTitle(`${profile.name} | Skillify`);
    return () => resetPageTitle();
  }, [profile]);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = isOwnProfile
        ? await api.getMyProfile()
        : await api.getUserProfile(userId);
      if (response.success) {
        const profileData = response.data || response.user;
        setProfile(profileData);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = (response) => {
    setProfile(response.user);
    updateUser(response.user);
    setEditing(false);
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
        toast.success(`Profile is now ${response.profileVisibility}`);
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

  if (loading) return <LoadingSpinner />;

  if (!profile) {
    return (
      <div className="page-wrap relative flex items-center justify-center min-h-[60vh]">
        <div className="rounded-2xl border border-error-200 bg-error-50/90 backdrop-blur-md px-8 py-6 text-error-700 flex flex-col items-center gap-4 font-bold shadow-lg text-center max-w-md">
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
      {/* Immersive Top Background that bleeds into the header */}
      <div
        className="absolute top-0 w-full h-[400px] z-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary-800) 0%, var(--color-accent-700) 100%)",
          maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 50%, transparent 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.80' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="page-container space-y-8 relative z-10 pt-[100px]"
      >
        <motion.section
          variants={itemVariants}
          className="glass-card shadow-2xl transition-all duration-300 border border-white/40 bg-white/80"
        >
          <div className="px-6 md:px-12 py-12 relative">
            <div className="flex flex-col items-center justify-center text-center relative z-10 w-full">
              {profile.profilePicture ? (
                <motion.div
                  initial={{ scale: 0.8, rotate: -5 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 120 }}
                  className="relative shrink-0 group mb-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-accent-500 rounded-[2.5rem] blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="h-44 w-44 rounded-[2.5rem] border-8 border-white object-cover shadow-2xl relative z-10 bg-white"
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, rotate: -5 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 120 }}
                  className="relative shrink-0 group mb-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-accent-500 rounded-[2.5rem] blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="flex h-44 w-44 items-center justify-center rounded-[2.5rem] border-8 border-white text-7xl font-black text-white shadow-2xl relative z-10 bg-gradient-to-br from-primary-500 to-accent-600">
                    {profile.name?.charAt(0)?.toUpperCase()}
                  </div>
                </motion.div>
              )}

              <div className="mt-2 w-full max-w-3xl mx-auto flex flex-col items-center">
                <h1
                  className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900"
                  style={{ color: "var(--color-neutral-900)" }}
                >
                  {profile.name}
                </h1>

                {(profile.currentRole || profile.company) && (
                  <p
                    className="text-xl font-bold mt-3 text-primary-600"
                    style={{ color: "var(--color-primary-600)" }}
                  >
                    {[profile.currentRole, profile.company]
                      .filter(Boolean)
                      .join(" at ")}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                  {profile.location && (
                    <span className="text-sm font-bold flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 text-neutral-600 border border-neutral-200 shadow-sm">
                      <MapPin className="w-4 h-4 text-primary-500" />
                      {profile.location}
                    </span>
                  )}
                  {profile.email && (
                    <span className="text-sm font-bold flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 text-neutral-600 border border-neutral-200 shadow-sm">
                      <Mail className="w-4 h-4 text-primary-500" />
                      {profile.email}
                    </span>
                  )}
                  <span className="text-sm font-bold flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 text-neutral-600 border border-neutral-200 shadow-sm">
                    <Calendar className="w-4 h-4 text-primary-500" />
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
                <div className="flex flex-wrap items-center justify-center gap-4 mt-10 w-full pt-8 border-t border-neutral-200/60 max-w-2xl mx-auto">
                  <button
                    type="button"
                    onClick={() => setEditing((prev) => !prev)}
                    className="btn-primary py-3 px-8 shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2 border border-primary-500/50 rounded-xl"
                  >
                    {editing ? (
                      <>
                        <X className="w-5 h-5" /> Cancel Edit
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-5 h-5" /> Edit Profile
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={toggleVisibility}
                    className="btn-secondary py-3 px-8 font-bold flex items-center justify-center gap-2 border-neutral-200 shadow-md bg-white hover:border-primary-300 rounded-xl transition-all"
                  >
                    {profile.profileVisibility === "public" ? (
                      <>
                        <EyeOff className="w-5 h-5 text-neutral-500" />
                        Make Private
                      </>
                    ) : (
                      <>
                        <Eye className="w-5 h-5 text-success-500" />
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="glass-card p-8 md:p-12 shadow-2xl border border-white/60 bg-white/90"
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
                <article className="glass-card p-8 md:p-10 shadow-lg border border-white/50 bg-white/80 hover:bg-white transition-colors duration-300">
                  <h2
                    className="text-2xl font-extrabold flex items-center gap-3 border-b-2 pb-5 mb-6"
                    style={{
                      color: "var(--color-neutral-900)",
                      borderColor: "var(--color-neutral-100)",
                    }}
                  >
                    <div className="p-3 rounded-2xl shadow-sm bg-primary-50 text-primary-600">
                      <User className="w-6 h-6" />
                    </div>
                    About Me
                  </h2>
                  <p className="text-lg font-medium leading-relaxed whitespace-pre-line text-neutral-600">
                    {profile.bio ||
                      "This user prefers to let their skills speak for themselves."}
                  </p>
                </article>

                {profile.experience && profile.experience.length > 0 && (
                  <article className="glass-card p-8 md:p-10 shadow-lg border border-white/50 bg-white/80 hover:bg-white transition-colors duration-300">
                    <h2
                      className="text-2xl font-extrabold flex items-center gap-3 border-b-2 pb-5 mb-6"
                      style={{
                        color: "var(--color-neutral-900)",
                        borderColor: "var(--color-neutral-100)",
                      }}
                    >
                      <div className="p-3 rounded-2xl shadow-sm bg-accent-50 text-accent-600">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      Experience
                    </h2>
                    <div className="space-y-6">
                      {Array.isArray(profile.experience) ? (
                        profile.experience.map((exp, idx) => (
                          <div
                            key={idx}
                            className="border-l-2 border-accent-200 pl-4 py-1"
                          >
                            <h3 className="text-xl font-bold text-neutral-800">
                              {exp.role}
                            </h3>
                            <p className="text-lg font-semibold text-accent-600">
                              {exp.company}
                            </p>
                            <p className="text-sm font-medium text-neutral-500 mt-1.5">
                              {formatDateRange(
                                exp.from,
                                exp.to,
                                exp.to === "Present",
                              )}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="whitespace-pre-line text-lg font-medium leading-relaxed text-neutral-600">
                          {profile.experience}
                        </p>
                      )}
                    </div>
                  </article>
                )}

                {profile.education && profile.education.length > 0 && (
                  <article className="glass-card p-8 md:p-10 shadow-lg border border-white/50 bg-white/80 hover:bg-white transition-colors duration-300">
                    <h2
                      className="text-2xl font-extrabold flex items-center gap-3 border-b-2 pb-5 mb-6"
                      style={{
                        color: "var(--color-neutral-900)",
                        borderColor: "var(--color-neutral-100)",
                      }}
                    >
                      <div className="p-3 rounded-2xl shadow-sm bg-primary-50 text-primary-600">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      Education
                    </h2>
                    <div className="space-y-6">
                      {Array.isArray(profile.education) ? (
                        profile.education.map((edu, idx) => (
                          <div
                            key={idx}
                            className="border-l-2 border-primary-200 pl-4 py-1"
                          >
                            <h3 className="text-xl font-bold text-neutral-800">
                              {edu.degree}
                            </h3>
                            <p className="text-lg font-semibold text-primary-600">
                              {edu.school}
                            </p>
                            <p className="text-sm font-medium text-neutral-500 mt-1.5">
                              {formatDateRange(
                                edu.from,
                                edu.to,
                                edu.isCurrentlyStudying,
                              )}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="whitespace-pre-line text-lg font-medium leading-relaxed text-neutral-600">
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
                  whileHover={{ y: -2 }}
                  className="glass-card p-8 shadow-lg border border-white/50 bg-white/80 h-full flex flex-col"
                >
                  <h2 className="text-xl font-extrabold mb-6 border-b-2 pb-4 text-neutral-900 border-neutral-100 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary-500" />
                    Quick Overview
                  </h2>
                  <div className="flex flex-col gap-6 flex-grow justify-center">
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        Availability
                      </p>
                      <p className="text-base font-bold capitalize inline-flex w-fit px-4 py-2 rounded-xl text-primary-700 bg-primary-50 border border-primary-100 shadow-sm">
                        {profile.availability || "Not specified"}
                      </p>
                    </div>
                    {typeof profile.yearsOfExperience === "number" && (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                          Total Experience
                        </p>
                        <p className="text-base font-bold inline-flex w-fit px-4 py-2 rounded-xl text-accent-700 bg-accent-50 border border-accent-100 shadow-sm">
                          {profile.yearsOfExperience}+ Years
                        </p>
                      </div>
                    )}
                  </div>
                </motion.article>

                {/* 2. Top Skills */}
                {profile.skills?.length > 0 && (
                  <motion.article
                    whileHover={{ y: -2 }}
                    className="glass-card p-8 shadow-lg border border-white/50 bg-white/80 h-full flex flex-col"
                  >
                    <h2 className="text-xl font-extrabold mb-6 border-b-2 pb-4 text-neutral-900 border-neutral-100">
                      Top Skills
                    </h2>
                    <div className="flex flex-wrap gap-2.5">
                      {profile.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="rounded-xl px-4 py-2 text-sm font-bold shadow-sm transition-transform hover:scale-105 cursor-default bg-neutral-100 text-neutral-800 border border-neutral-200"
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
                    whileHover={{ y: -2 }}
                    className="glass-card p-8 shadow-lg border border-white/50 bg-white/80 h-full flex flex-col"
                  >
                    <h2 className="text-xl font-extrabold mb-6 border-b-2 pb-4 text-neutral-900 border-neutral-100">
                      Links & Social
                    </h2>
                    <div className="flex flex-col gap-3 flex-grow justify-center">
                      {profile.githubUrl && (
                        <a
                          href={profile.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 bg-white shadow-sm hover:shadow-md hover:border-neutral-300 transition-all font-bold text-sm group"
                        >
                          <div className="p-2 rounded-lg bg-neutral-100 group-hover:bg-neutral-200 transition-colors">
                            <GitBranch className="w-5 h-5 text-neutral-700 group-hover:text-black" />
                          </div>
                          GitHub Profile
                        </a>
                      )}
                      {profile.linkedinUrl && (
                        <a
                          href={profile.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 bg-white shadow-sm hover:shadow-md hover:border-[#0077b5]/30 transition-all font-bold text-sm group"
                        >
                          <div className="p-2 rounded-lg bg-neutral-100 group-hover:bg-[#0077b5]/10 transition-colors">
                            <Link2 className="w-5 h-5 text-neutral-700 group-hover:text-[#0077b5]" />
                          </div>
                          LinkedIn Profile
                        </a>
                      )}
                      {profile.portfolioUrl && (
                        <a
                          href={profile.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 bg-white shadow-sm hover:shadow-md hover:border-primary-300 transition-all font-bold text-sm group"
                        >
                          <div className="p-2 rounded-lg bg-neutral-100 group-hover:bg-primary-50 transition-colors">
                            <Globe className="w-5 h-5 text-neutral-700 group-hover:text-primary-600" />
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
                    whileHover={{ y: -2 }}
                    className="glass-card p-8 shadow-lg border border-white/50 bg-white/80 h-full flex flex-col justify-center"
                  >
                    <h2 className="text-xl font-extrabold mb-6 border-b-2 pb-4 flex items-center gap-2 text-neutral-900 border-neutral-100">
                      <FileText className="w-5 h-5 text-error-500" />
                      Resume
                    </h2>
                    <a
                      href={profile.resume}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full text-center py-4 font-bold rounded-xl transition-all shadow-md hover:-translate-y-1 hover:shadow-lg bg-error-50 text-error-600 border border-error-200 hover:bg-error-100"
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
                    whileHover={{ y: -2 }}
                    className="glass-card p-8 shadow-lg border bg-error-50/30 border-error-200 flex flex-col justify-center"
                  >
                    <h2 className="text-xl font-extrabold flex items-center gap-3 border-b-2 pb-5 mb-5 text-error-700 border-error-100">
                      <div className="p-2 rounded-xl bg-error-100 text-error-600 shadow-sm">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      Danger Zone
                    </h2>
                    <p className="text-sm font-semibold mb-6 leading-relaxed text-error-800/80">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full py-3.5 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-red-500/30 transition-all"
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
    </div>
  );
}
