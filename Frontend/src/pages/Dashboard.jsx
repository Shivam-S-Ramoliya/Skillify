import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Skeleton from "../components/common/Skeleton";
import { setPageTitle, resetPageTitle } from "../utils/pageTitle";

export default function Dashboard() {
  const { user } = useAuth();
  const [profileStatus, setProfileStatus] = useState(null);
  const [sentApps, setSentApps] = useState([]);
  const [receivedApps, setReceivedApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageTitle("Dashboard | Skillify");
    return () => resetPageTitle();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const results = await Promise.allSettled([
        api.getProfileStatus(),
        api.getSentApplications(),
        api.getReceivedApplications(),
      ]);

      if (results[0].status === "fulfilled" && results[0].value.success) {
        setProfileStatus(results[0].value.data);
      }
      if (results[1].status === "fulfilled" && results[1].value.success) {
        setSentApps(results[1].value.data || []);
      }
      if (results[2].status === "fulfilled" && results[2].value.success) {
        setReceivedApps(results[2].value.data || []);
      }
    } catch (err) {
      // keep page usable even if stats fail
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrap relative">
        <div className="page-container space-y-8 relative z-10">
          {/* Welcome Section Skeleton */}
          <section className="bg-primary text-white p-8 md:p-10 rounded-2xl border border-primary/20 shadow-md relative overflow-hidden animate-pulse">
            <div className="h-6 w-24 bg-white/20 rounded-full mb-4" />
            <div className="h-10 w-64 bg-white/20 rounded-lg mb-4" />
            <div className="h-4 w-3/4 bg-white/20 rounded-lg" />
          </section>

          {/* Profile Completion and Quick Stats Grid Skeleton */}
          <section className="grid gap-6 md:grid-cols-3">
            <div className="bg-surface border border-secondary/15 rounded-2xl p-6 md:p-8 md:col-span-2 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-11 h-11" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="mt-8 rounded-xl p-5 border border-secondary/15 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>

            <div className="bg-surface border border-secondary/15 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-11 h-11" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="space-y-4">
                <div className="border border-secondary/15 rounded-xl p-5 space-y-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="border border-secondary/15 rounded-xl p-5 space-y-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
          </section>

          {/* Applications Overview Section Skeleton */}
          <section className="bg-surface border border-secondary/15 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-11 h-11" />
              <Skeleton className="h-6 w-48" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="border border-secondary/15 rounded-xl p-5 md:p-6 space-y-6">
                <div className="flex justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              </div>
              <div className="border border-secondary/15 rounded-xl p-5 md:p-6 space-y-6">
                <div className="flex justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const completion = profileStatus?.completionPercentage || 0;
  const missingFields = profileStatus?.missingFields || [];

  const getAppStats = (apps) => {
    const total = apps.length;
    const pending = apps.filter((a) => a.status === "pending").length;
    const accepted = apps.filter((a) => a.status === "accepted").length;
    const rejected = apps.filter((a) => a.status === "rejected").length;
    return { total, pending, accepted, rejected };
  };

  const sentStats = getAppStats(sentApps);
  const receivedStats = getAppStats(receivedApps);

  return (
    <div className="page-wrap relative">
      <div className="page-container space-y-8 relative z-10">
        {/* Welcome Section */}
        <section className="bg-primary text-white p-5 md:p-10 rounded-2xl border border-primary/20 shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                Workspace
              </span>
            </div>
            <h1 className="mt-2 text-2xl md:text-5xl font-bold tracking-tight">
              Welcome, <span className="text-tertiary">{user?.name}</span>
            </h1>
            <p className="mt-3 md:mt-4 text-sm md:text-lg max-w-2xl leading-relaxed text-white/80">
              Build your career by shipping real projects. Discover jobs, track
              applications, and collaborate with clients worldwide.
            </p>
          </div>
        </section>

        {/* Profile Completion and Quick Stats Grid */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="bg-surface border border-secondary/15 rounded-2xl p-5 md:p-8 md:col-span-2 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-surface border border-secondary/15 shadow-sm text-tertiary">
                  <svg
                    className="w-6 h-6 text-tertiary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-primary">
                  Profile completion
                </h2>
              </div>
              <span className="badge-primary">
                {completion}%
              </span>
            </div>

            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-secondary/10 border border-secondary/5">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out bg-tertiary"
                style={{
                  width: `${completion}%`,
                }}
              />
            </div>

            {missingFields.length > 0 ? (
              <div className="mt-8 rounded-xl p-5 alert-warning">
                <div className="flex gap-4">
                  <div className="p-2 rounded-lg bg-surface border border-warning-700/20 flex-shrink-0 self-start text-warning-700">
                    <svg
                      className="w-5 h-5 text-warning-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-wide uppercase text-warning-700">
                      Complete these fields to boost visibility:
                    </h3>
                    <p className="mt-1 text-sm font-medium leading-relaxed max-w-lg text-warning-700/80">
                      {missingFields.join(", ")}
                    </p>
                    <Link
                      to="/complete-profile"
                      className="btn-primary mt-4 py-2 px-5 text-sm"
                    >
                      Complete Profile
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-xl p-5 flex items-start gap-4 alert-success">
                <div className="p-2 rounded-lg bg-surface border border-success-700/20 flex-shrink-0 text-success-700">
                  <svg
                    className="w-5 h-5 text-success-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide uppercase mt-0.5 text-success-700">
                    Profile is 100% complete
                  </h3>
                  <p className="mt-1 text-sm font-semibold max-w-lg text-success-700/80">
                    Your profile is fully optimized and ready to attract top
                    clients and collaborators.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-surface border border-secondary/15 rounded-2xl p-5 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-4 mb-8 text-primary">
              <div className="p-2.5 rounded-lg bg-surface border border-secondary/15 shadow-sm text-tertiary">
                <svg
                  className="w-6 h-6 text-tertiary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              Quick stats
            </h2>
            <div className="space-y-4">
              <div className="bg-surface border border-secondary/15 rounded-xl p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider mb-2 text-secondary">
                  Skills listed
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-extrabold tracking-tighter text-primary">
                    {user?.skills?.length || 0}
                  </p>
                  <span className="text-sm font-bold text-secondary">
                    skills
                  </span>
                </div>
              </div>
              <div className="bg-surface border border-secondary/15 rounded-xl p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider mb-2 text-secondary">
                  Experience
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-extrabold tracking-tighter text-primary">
                    {user?.yearsOfExperience || 0}
                  </p>
                  <span className="text-sm font-bold text-secondary">
                    years
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Applications Overview Section */}
        <section className="bg-surface border border-secondary/15 rounded-2xl p-5 md:p-8 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-4 mb-8 text-primary">
            <div className="p-2.5 rounded-lg bg-surface border border-secondary/15 shadow-sm text-tertiary">
              <svg
                className="w-6 h-6 text-tertiary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            Applications overview
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* My Submitted Applications */}
            <div className="flex flex-col h-full bg-surface border border-secondary/15 rounded-xl p-4 md:p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-primary">My Submitted Applications</h3>
                  <p className="text-sm font-semibold text-secondary mt-1">
                    Track the status of your job applications
                  </p>
                </div>
                <Link
                  to="/applications?tab=sent"
                  className="text-xs font-bold text-tertiary hover:underline flex items-center gap-1 self-start"
                >
                  View Details
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2 mb-6">
                <div className="surface-sunken p-4 rounded-xl flex flex-col justify-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    Total Sent
                  </span>
                  <span className="text-3xl font-extrabold text-primary mt-1">
                    {sentStats.total}
                  </span>
                </div>
                <div className="bg-warning-50/50 dark:bg-warning-500/10 border border-warning-500/20 p-4 rounded-xl flex flex-col justify-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-warning-700">
                    Pending
                  </span>
                  <span className="text-3xl font-extrabold text-warning-700 mt-1">
                    {sentStats.pending}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="bg-success-50/50 dark:bg-success-500/10 border border-success-500/20 p-4 rounded-xl flex flex-col justify-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-success-700">
                    Accepted
                  </span>
                  <span className="text-2xl font-extrabold text-success-700 mt-0.5">
                    {sentStats.accepted}
                  </span>
                </div>
                <div className="bg-error-50/50 dark:bg-error-500/10 border border-error-500/20 p-4 rounded-xl flex flex-col justify-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-error-700">
                    Rejected
                  </span>
                  <span className="text-2xl font-extrabold text-error-700 mt-0.5">
                    {sentStats.rejected}
                  </span>
                </div>
              </div>
            </div>

            {/* Applications Received */}
            <div className="flex flex-col h-full bg-surface border border-secondary/15 rounded-xl p-4 md:p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-primary">Applications Received</h3>
                  <p className="text-sm font-semibold text-secondary mt-1">
                    Manage applicants for jobs you posted
                  </p>
                </div>
                <Link
                  to="/applications?tab=received"
                  className="text-xs font-bold text-tertiary hover:underline flex items-center gap-1 self-start"
                >
                  View Details
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2 mb-6">
                <div className="surface-sunken p-4 rounded-xl flex flex-col justify-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    Total Received
                  </span>
                  <span className="text-3xl font-extrabold text-primary mt-1">
                    {receivedStats.total}
                  </span>
                </div>
                <div className="bg-warning-50/50 dark:bg-warning-500/10 border border-warning-500/20 p-4 rounded-xl flex flex-col justify-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-warning-700">
                    Pending Review
                  </span>
                  <span className="text-3xl font-extrabold text-warning-700 mt-1">
                    {receivedStats.pending}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="bg-success-50/50 dark:bg-success-500/10 border border-success-500/20 p-4 rounded-xl flex flex-col justify-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-success-700">
                    Accepted
                  </span>
                  <span className="text-2xl font-extrabold text-success-700 mt-0.5">
                    {receivedStats.accepted}
                  </span>
                </div>
                <div className="bg-error-50/50 dark:bg-error-500/10 border border-error-500/20 p-4 rounded-xl flex flex-col justify-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-error-700">
                    Rejected
                  </span>
                  <span className="text-2xl font-extrabold text-error-700 mt-0.5">
                    {receivedStats.rejected}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="bg-surface border border-secondary/15 rounded-2xl p-5 md:p-8 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-4 mb-8 text-primary">
            <div className="p-2.5 rounded-lg bg-surface border border-secondary/15 shadow-sm text-tertiary">
              <svg
                className="w-6 h-6 text-tertiary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            Quick actions
          </h2>
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            <Link
              to="/discover"
              className="group rounded-xl bg-surface p-4 md:p-6 border border-secondary/15 hover:border-tertiary/30 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-secondary/5 border border-secondary/10 flex items-center justify-center text-tertiary transition-all duration-200 mb-3 md:mb-5">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-base md:text-lg text-primary">
                Discover Jobs
              </h3>
              <p className="text-xs md:text-sm font-semibold mt-1 text-secondary">
                Browse open opportunities
              </p>
            </Link>

            <Link
              to="/publish-job"
              className="group rounded-xl p-4 md:p-6 bg-tertiary border border-tertiary/20 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden text-white"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 border border-white/10 flex items-center justify-center text-white mb-3 md:mb-5 group-hover:scale-105 transition-all duration-200">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-white text-base md:text-lg">Publish Job</h3>
              <p className="text-xs md:text-sm font-semibold mt-1 text-white/80">
                Hire top talent easily
              </p>
            </Link>

            <Link
              to="/applications"
              className="group rounded-xl bg-surface p-4 md:p-6 border border-secondary/15 hover:border-tertiary/30 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-secondary/5 border border-secondary/10 flex items-center justify-center text-tertiary transition-all duration-200 mb-3 md:mb-5">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-base md:text-lg text-primary">
                Applications
              </h3>
              <p className="text-xs md:text-sm font-semibold mt-1 text-secondary">
                Track your progress
              </p>
            </Link>

            <Link
              to="/profile"
              className="group rounded-xl bg-surface p-4 md:p-6 border border-secondary/15 hover:border-tertiary/30 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-secondary/5 border border-secondary/10 flex items-center justify-center text-tertiary transition-all duration-200 mb-3 md:mb-5">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-base md:text-lg text-primary">
                Edit Profile
              </h3>
              <p className="text-xs md:text-sm font-semibold mt-1 text-secondary">
                Update your info
              </p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
