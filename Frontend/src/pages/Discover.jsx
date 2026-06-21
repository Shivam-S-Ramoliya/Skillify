import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Skeleton from "../components/common/Skeleton";
import ProfileCard from "../components/cards/ProfileCard";

function JobCardSkeleton() {
  return (
    <div className="surface-card p-6 md:p-8 relative overflow-hidden flex flex-col h-full animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-4 w-full">
          <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-4 ml-16">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="mt-auto pt-5 flex items-center justify-between border-t border-secondary/10">
        <Skeleton className="h-10 w-28 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function FreelancerCardSkeleton() {
  return (
    <div className="surface-card flex h-full flex-col overflow-hidden animate-pulse">
      <div className="h-24 bg-secondary/10 dark:bg-secondary/20"></div>
      <div className="-mt-10 px-6 pb-6 flex flex-col flex-grow relative z-10">
        <div className="flex items-end gap-3">
          <Skeleton className="h-20 w-20 rounded-2xl border-2 border-surface" />
          <div className="pb-1 space-y-1.5 flex-1">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-4 w-32 mt-4" />
        <Skeleton className="h-3.5 w-full mt-3" />
        <Skeleton className="h-3.5 w-4/5 mt-1" />
        <div className="mt-4 pt-4 flex flex-wrap gap-2 border-t border-secondary/10">
          <Skeleton className="h-6 w-14 rounded-lg" />
          <Skeleton className="h-6 w-14 rounded-lg" />
          <Skeleton className="h-6 w-14 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full mt-5 rounded-lg" />
      </div>
    </div>
  );
}
import { setPageTitle, resetPageTitle } from "../utils/pageTitle";
import { motion } from "framer-motion";
import {
  Search,
  Info,
  DollarSign,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Clock,
  User,
} from "lucide-react";

// GitHub icon component
const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const statusStyles = {
  pending: {
    bg: "rgba(245, 158, 11, 0.1)",
    text: "var(--color-warning-700)",
    border: "rgba(245, 158, 11, 0.2)",
  },
  accepted: {
    bg: "rgba(34, 197, 94, 0.1)",
    text: "var(--color-success-700)",
    border: "rgba(34, 197, 94, 0.2)",
  },
  rejected: {
    bg: "rgba(239, 68, 68, 0.1)",
    text: "var(--color-error-700)",
    border: "rgba(239, 68, 68, 0.2)",
  },
  withdrawn: {
    bg: "rgba(113, 111, 111, 0.1)",
    text: "var(--color-secondary)",
    border: "rgba(113, 111, 111, 0.15)",
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

let lastDiscoverPrivateWarningAt = 0;
const PRIVATE_WARNING_COOLDOWN_MS = 1500;

export default function Discover() {
  const { user } = useAuth();
  const toast = useToast();
  const [cols, setCols] = useState(4);
  const [activeTab, setActiveTab] = useState("jobs"); // 'jobs' | 'freelancers'

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 1280) setCols(4);
      else if (w >= 1024) setCols(3);
      else if (w >= 768) setCols(2);
      else setCols(1);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [jobs, setJobs] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchSkill, setSearchSkill] = useState("");
  const [searchFreelancer, setSearchFreelancer] = useState("");
  const [jobsPage, setJobsPage] = useState(1);
  const [freelancersPage, setFreelancersPage] = useState(1);
  const [jobsTotalPages, setJobsTotalPages] = useState(1);
  const [freelancersTotalPages, setFreelancersTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalFreelancers, setTotalFreelancers] = useState(0);
  const [applyLoadingId, setApplyLoadingId] = useState("");

  useEffect(() => {
    setPageTitle(activeTab === "jobs" ? "Discover Jobs | Skillify" : "Discover Freelancers | Skillify");
    return () => resetPageTitle();
  }, [activeTab]);

  const isPublicProfile = user?.profileVisibility === "public";

  useEffect(() => {
    if (!isPublicProfile) {
      setLoading(false);
      const now = Date.now();
      if (now - lastDiscoverPrivateWarningAt > PRIVATE_WARNING_COOLDOWN_MS) {
        toast.warning("Your profile must be Public to discover other freelancers. Update it in your profile settings.");
        lastDiscoverPrivateWarningAt = now;
      }
      setJobs([]);
      setFreelancers([]);
      setTotalJobs(0);
      setTotalFreelancers(0);
      setJobsTotalPages(1);
      setFreelancersTotalPages(1);
      return;
    }
  }, [isPublicProfile]);

  useEffect(() => {
    if (!isPublicProfile) return;
    if (activeTab === "jobs") {
      fetchJobs();
    } else {
      fetchFreelancers();
    }
  }, [jobsPage, freelancersPage, activeTab, isPublicProfile]);

  const fetchJobs = async (overrides = {}) => {
    const effectiveJobsPage = overrides.jobsPage ?? jobsPage;
    const effectiveSkill = overrides.skill ?? searchSkill;

    setLoading(true);
    try {
      const response = await api.discoverJobs({
        page: effectiveJobsPage,
        limit: 8,
        skill: effectiveSkill,
      });

      if (response.success) {
        setJobs(response.data || []);
        setJobsTotalPages(response.pages || 1);
        setTotalJobs(response.total || 0);
      }
    } catch (err) {
      toast.error(err.message || "Could not load jobs right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFreelancers = async (overrides = {}) => {
    const effectivePage = overrides.page ?? freelancersPage;
    const effectiveSearch = overrides.search ?? searchFreelancer;

    setLoading(true);
    try {
      const response = await api.discoverProfiles({
        page: effectivePage,
        limit: 8,
        search: effectiveSearch,
      });

      if (response.success) {
        setFreelancers(response.data || []);
        setFreelancersTotalPages(response.pages || 1);
        setTotalFreelancers(response.total || 0);
      }
    } catch (err) {
      toast.error(err.message || "Could not load freelancers right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!isPublicProfile) return;
    if (activeTab === "jobs") {
      setJobsPage(1);
      fetchJobs({ jobsPage: 1, skill: searchSkill });
    } else {
      setFreelancersPage(1);
      fetchFreelancers({ page: 1, search: searchFreelancer });
    }
  };

  const handleClearFilters = () => {
    if (!isPublicProfile) return;
    if (activeTab === "jobs") {
      setSearchSkill("");
      setJobsPage(1);
      fetchJobs({ jobsPage: 1, skill: "" });
    } else {
      setSearchFreelancer("");
      setFreelancersPage(1);
      fetchFreelancers({ page: 1, search: "" });
    }
  };

  const handleApply = async (jobId) => {
    if (!isPublicProfile) {
      toast.warning("Your profile must be Public to apply for jobs. Update it in your profile settings.");
      return;
    }
    setApplyLoadingId(jobId);

    try {
      await api.applyToJob(jobId);
      toast.success("Application submitted! The employer will review it soon.");
      setJobs((prev) =>
        prev.map((job) =>
          job._id === jobId
            ? { ...job, hasApplied: true, applicationStatus: "pending" }
            : job,
        ),
      );
    } catch (err) {
      toast.error(err.message || "Could not submit application. Please try again.");
    } finally {
      setApplyLoadingId("");
    }
  };

  // Render search layouts instantly, and render skeletons below inside tabs.

  return (
    <div className="page-wrap relative">
      <div className="page-container space-y-8 relative z-10">
        {/* Toggle tabs */}
        <div className="flex gap-2 md:gap-4 p-1 bg-secondary/5 border border-secondary/10 rounded-xl w-full md:w-fit">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex-1 md:flex-initial px-4 md:px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer text-center ${
              activeTab === "jobs"
                ? "bg-tertiary text-white shadow-sm"
                : "text-secondary hover:text-primary hover:bg-secondary/5"
            }`}
          >
            Discover Jobs
          </button>
          <button
            onClick={() => setActiveTab("freelancers")}
            className={`flex-1 md:flex-initial px-4 md:px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer text-center ${
              activeTab === "freelancers"
                ? "bg-tertiary text-white shadow-sm"
                : "text-secondary hover:text-primary hover:bg-secondary/5"
            }`}
          >
            Discover Freelancers
          </button>
        </div>

        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-secondary/15 rounded-2xl p-5 md:p-12 relative overflow-hidden shadow-sm"
        >
          <div className="relative z-10">
            {activeTab === "jobs" ? (
              <>
                <h1 className="text-2xl md:text-5xl font-extrabold tracking-tight mb-3 md:mb-4 text-primary">
                  Discover <span className="text-tertiary">Opportunities</span>
                </h1>
                <p className="text-sm md:text-lg font-semibold max-w-2xl mb-6 md:mb-8 text-secondary">
                  Explore freelance and open-source roles posted by our community of
                  innovators and creators.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl md:text-5xl font-extrabold tracking-tight mb-3 md:mb-4 text-primary">
                  Discover <span className="text-tertiary">Freelancers</span>
                </h1>
                <p className="text-sm md:text-lg font-semibold max-w-2xl mb-6 md:mb-8 text-secondary">
                  Connect and collaborate with skilled developers, designers, and creators from around the world.
                </p>
              </>
            )}

            <form
              onSubmit={handleSearch}
              className="mt-4 flex flex-col md:flex-row gap-4 md:items-center"
            >
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-secondary" />
                </div>
                {activeTab === "jobs" ? (
                  <input
                    type="text"
                    value={searchSkill}
                    onChange={(e) => setSearchSkill(e.target.value)}
                    placeholder="Search by skill (React, Node.js, Design...)"
                    className="input-base pl-14 py-4 text-base w-full"
                  />
                ) : (
                  <input
                    type="text"
                    value={searchFreelancer}
                    onChange={(e) => setSearchFreelancer(e.target.value)}
                    placeholder="Search by name, username, role, or skills..."
                    className="input-base pl-14 py-4 text-base w-full"
                  />
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-primary py-4 px-8 md:w-auto w-full"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="btn-secondary py-4 px-6 md:w-auto w-full"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === "jobs" ? (
            <>
              <div className="mb-8 flex items-center justify-between px-2">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-primary">
                  <span className="flex h-3 w-3 rounded-full bg-tertiary shadow-sm animate-pulse"></span>
                  Latest Jobs
                </h2>
                <div className="badge-primary text-xs">
                  {totalJobs} available
                </div>
              </div>

          {loading && jobsPage === 1 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </div>
          ) : jobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface border border-secondary/15 rounded-2xl p-16 text-center shadow-sm"
            >
              <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 bg-secondary/5 text-secondary border border-secondary/10">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2 text-primary">
                No jobs found
              </h3>
              <p className="font-medium text-secondary mb-6 max-w-md mx-auto">
                We couldn't find any opportunities matching your current filter.
                Try adjusting your search criteria.
              </p>
              <button
                onClick={handleClearFilters}
                className="btn-primary shadow-md"
              >
                Clear filters to see all
              </button>
            </motion.div>
          ) : (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-6 lg:grid-cols-2"
              >
                {jobs.map((job) => (
                  <motion.article
                    variants={cardVariants}
                    key={job._id}
                    className="group surface-card-hover p-5 md:p-8 relative overflow-hidden flex flex-col h-full"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black flex-shrink-0 transition-all duration-200 group-hover:bg-tertiary/10 group-hover:text-tertiary bg-secondary/5 text-primary border border-secondary/10 shadow-sm">
                          {job.jobName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold transition-colors line-clamp-1 text-primary group-hover:text-tertiary">
                            {job.jobName}
                          </h3>
                          <p className="mt-1 text-sm font-semibold flex items-center gap-1.5 text-secondary">
                            <Briefcase className="w-4 h-4 text-tertiary" />
                            {job.postedBy?.name || "Unknown"}
                          </p>
                        </div>
                      </div>

                      {job.applicationStatus && (
                        <span
                          className="rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider border"
                          style={{
                            backgroundColor:
                              statusStyles[job.applicationStatus]?.bg ||
                              statusStyles.pending.bg,
                            color:
                              statusStyles[job.applicationStatus]?.text ||
                              statusStyles.pending.text,
                            borderColor:
                              statusStyles[job.applicationStatus]?.border ||
                              statusStyles.pending.border,
                          }}
                        >
                          {job.applicationStatus}
                        </span>
                      )}
                    </div>

                    {/* Posted and Closes dates */}
                    <div className="flex items-center gap-4 mb-4 ml-16 text-sm">
                      {job.createdAt && (
                        <div className="flex items-center gap-1.5 text-secondary">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="font-medium">
                            Posted{" "}
                            {new Date(job.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      )}
                      {job.closingDate && (
                        <div className="flex items-center gap-1.5 text-red-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-semibold">
                            Closes{" "}
                            {new Date(job.closingDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mb-4 flex-grow">
                      <p className="line-clamp-2 text-sm leading-relaxed font-medium text-secondary">
                        {job.jobDetails}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-5">
                      {(job.skillsRequired || []).map((skill) => (
                        <span
                          key={`${job._id}-${skill}`}
                          className="badge-neutral font-bold text-xs py-1 px-2.5"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Info grid — labeled fields */}
                    <div className="grid gap-3 text-xs sm:grid-cols-2 p-4 rounded-xl mb-5 bg-secondary/5 border border-secondary/10">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-surface border border-secondary/15 shadow-sm p-1.5 rounded-lg flex-shrink-0">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-secondary">
                            Experience
                          </p>
                          <p className="font-semibold text-primary text-sm">
                            {job.experienceRequired || "Any"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="bg-surface border border-secondary/15 shadow-sm p-1.5 rounded-lg flex-shrink-0">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-secondary">
                            Salary
                          </p>
                          <p className="font-semibold text-primary text-sm">
                            {job.salary || "Unpaid"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="bg-surface border border-secondary/15 shadow-sm p-1.5 rounded-lg flex-shrink-0">
                          <Info className="w-4 h-4 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-secondary">
                            Type
                          </p>
                          <p className="font-semibold text-primary text-sm capitalize">
                            {job.compensationType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="bg-surface border border-secondary/15 shadow-sm p-1.5 rounded-lg flex-shrink-0">
                          <Calendar className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-secondary">
                            Duration
                          </p>
                          <p className="font-semibold text-primary text-xs">
                            {new Date(job.durationFrom).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}{" "}
                            –{" "}
                            {new Date(job.durationTo).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-5 flex flex-wrap items-center justify-between gap-3 border-t border-secondary/15">
                      <div className="flex-1">
                        {!job.hasApplied ||
                        job.applicationStatus === "withdrawn" ? (
                          <button
                            type="button"
                            onClick={() => handleApply(job._id)}
                            disabled={applyLoadingId === job._id}
                            className="btn-primary w-full py-2.5 px-4"
                          >
                            {applyLoadingId === job._id ? (
                              <span className="flex items-center justify-center gap-2">
                                <svg
                                  className="animate-spin h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Applying
                              </span>
                            ) : (
                              "Apply Now"
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="btn-secondary w-full py-2.5 opacity-50 cursor-not-allowed text-secondary border border-secondary/20"
                          >
                            Applied
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {job.postedBy?._id && (
                          <Link
                            to={job.postedBy.username ? `/profile/${job.postedBy.username}` : `/profile/${job.postedBy._id}`}
                            className="p-2.5 rounded-lg bg-surface border border-secondary/35 text-secondary hover:text-tertiary hover:border-tertiary transition-all duration-200 active:scale-[0.98]"
                            title={`View ${job.postedBy?.name || "Employer"}'s Profile`}
                          >
                            <User className="w-5 h-5 transition-transform hover:scale-105" />
                          </Link>
                        )}
                        {job.githubRepoUrl && (
                          <a
                            href={job.githubRepoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 rounded-lg bg-surface border border-secondary/35 text-secondary hover:text-tertiary hover:border-tertiary transition-all duration-200 active:scale-[0.98]"
                            title="View Repository"
                          >
                            <GithubIcon className="w-5 h-5 transition-transform hover:scale-105" />
                          </a>
                        )}
                        {job.jobDescriptionDocument && (
                          <a
                            href={job.jobDescriptionDocument}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 rounded-lg bg-surface border border-secondary/35 text-secondary hover:text-tertiary hover:border-tertiary transition-all duration-200 active:scale-[0.98]"
                            title="View Document"
                          >
                            <FileText className="w-5 h-5 transition-transform hover:scale-105" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>

              {jobsTotalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="mt-12 flex items-center justify-center gap-4 p-3 rounded-xl max-w-sm mx-auto bg-surface border border-secondary/15 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setJobsPage((prev) => Math.max(1, prev - 1))}
                    disabled={jobsPage === 1}
                    className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface border border-secondary/25 text-secondary hover:text-primary hover:border-primary transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <p className="text-sm font-bold w-28 text-center uppercase tracking-wider text-secondary">
                    Page{" "}
                    <span className="text-base mx-1 text-tertiary">
                      {jobsPage}
                    </span>
                    / {jobsTotalPages}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setJobsPage((prev) => Math.min(jobsTotalPages, prev + 1))
                    }
                    disabled={jobsPage === jobsTotalPages}
                    className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface border border-secondary/25 text-secondary hover:text-primary hover:border-primary transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </>
          )}
        </>
      ) : (
        <>
              <div className="mb-8 flex items-center justify-between px-2">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-primary">
                  <span className="flex h-3 w-3 rounded-full bg-tertiary shadow-sm animate-pulse"></span>
                  Active Freelancers
                </h2>
                <div className="badge-primary text-xs">
                  {totalFreelancers} listed
                </div>
              </div>

              {loading && freelancersPage === 1 ? (
                <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <FreelancerCardSkeleton />
                  <FreelancerCardSkeleton />
                  <FreelancerCardSkeleton />
                  <FreelancerCardSkeleton />
                </div>
              ) : freelancers.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-surface border border-secondary/15 rounded-2xl p-16 text-center shadow-sm"
                >
                  <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 bg-secondary/5 text-secondary border border-secondary/10">
                    <Search className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight mb-2 text-primary">
                    No freelancers found
                  </h3>
                  <p className="font-medium text-secondary mb-6 max-w-md mx-auto">
                    We couldn't find any freelancers matching your search terms.
                    Try adjusting your criteria.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="btn-primary shadow-md"
                  >
                    Clear search
                  </button>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  >
                    {freelancers.slice(0, !searchFreelancer.trim() ? cols * 2 : undefined).map((fl) => (
                      <motion.div variants={cardVariants} key={fl._id}>
                        <ProfileCard user={fl} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {freelancersTotalPages > 1 && searchFreelancer.trim() !== "" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      className="mt-12 flex items-center justify-center gap-4 p-3 rounded-xl max-w-sm mx-auto bg-surface border border-secondary/15 shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => setFreelancersPage((prev) => Math.max(1, prev - 1))}
                        disabled={freelancersPage === 1}
                        className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface border border-secondary/25 text-secondary hover:text-primary hover:border-primary transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <p className="text-sm font-bold w-28 text-center uppercase tracking-wider text-secondary">
                        Page{" "}
                        <span className="text-base mx-1 text-tertiary">
                          {freelancersPage}
                        </span>
                        / {freelancersTotalPages}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setFreelancersPage((prev) => Math.min(freelancersTotalPages, prev + 1))
                        }
                        disabled={freelancersPage === freelancersTotalPages}
                        className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface border border-secondary/25 text-secondary hover:text-primary hover:border-primary transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </>
          )}
        </motion.section>
      </div>
    </div>
  );
}
