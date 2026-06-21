import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { setPageTitle, resetPageTitle } from "../utils/pageTitle";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Layers,
  LayoutDashboard,
  ArrowRight,
  CheckCircle2,
  Briefcase,
} from "lucide-react";

const pillars = [
  {
    title: "Freelance-ready profiles",
    icon: <ShieldCheck className="w-7 h-7 text-tertiary" />,
    description:
      "Showcase your expertise, experience, and project links so clients can trust you quickly and hire you seamlessly.",
  },
  {
    title: "Open project collaboration",
    icon: <Layers className="w-7 h-7 text-tertiary" />,
    description:
      "Publish contribution opportunities and attract contributors by matching required skills and verified experience.",
  },
  {
    title: "Transparent applications",
    icon: <LayoutDashboard className="w-7 h-7 text-tertiary" />,
    description:
      "Track sent and received applications with clear status actions in one unified, clutter-free workspace.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export default function Home() {
  const { user } = useAuth();

  useEffect(() => {
    setPageTitle("Home");
    return () => resetPageTitle();
  }, []);

  return (
    <div className="relative overflow-hidden w-full app-shell">
      <div className="page-container relative z-10 pt-24 pb-32">
        {/* Hero Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center w-full max-w-none mx-auto px-2 sm:px-4 mt-4 md:mt-8"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface border border-secondary/15 shadow-sm mb-8"
          >
            <span className="flex h-2.5 w-2.5 rounded-full bg-tertiary animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Freelancer + Open Source Workspace
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-3xl md:text-7xl font-extrabold tracking-[-0.03em] mb-6 md:mb-8 leading-[1.12] text-primary"
          >
            Build your career by shipping{" "}
            <span className="text-tertiary">real projects</span> with
            the perfect team
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-4 md:mt-6 text-base md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8 md:mb-12 text-secondary"
          >
            Discover opportunities, publish projects, and manage
            applications—all in one powerful platform built for freelancers.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-10"
          >
            {user ? (
              <>
                <Link
                  to="/discover"
                  className="btn-primary flex items-center gap-2 group w-full sm:w-auto"
                >
                  <Briefcase className="w-5 h-5 group-hover:scale-105 transition-transform" />
                  Discover Jobs
                </Link>
                <Link
                  to="/publish-job"
                  className="btn-secondary w-full sm:w-auto"
                >
                  Publish a Job
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="btn-primary flex items-center gap-2 group w-full sm:w-auto"
                >
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="btn-secondary w-full sm:w-auto">
                  Sign In
                </Link>
              </>
            )}
          </motion.div>
        </motion.section>

        {/* Feature Grid */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mt-32 w-full xl:w-[90%] mx-auto px-4 relative z-20"
        >
          <div className="bg-surface border border-secondary/15 rounded-2xl p-5 md:p-14 relative overflow-hidden shadow-sm">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/3">
                <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-primary">
                  Everything you need
                </h2>
                <p className="text-lg leading-relaxed text-secondary">
                  Tools designed to help you find work, showcase your skills,
                  and ship real projects.
                </p>
              </div>
              <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  "Publish global jobs",
                  "Apply instantly",
                  "Track real-time statuses",
                  "Manage rich profiles",
                  "Share your portfolio",
                  "Collaborate globally",
                ].map((item) => (
                  <motion.div
                    key={item}
                    whileHover={{ scale: 1.02 }}
                    className="px-5 py-4 text-sm font-bold flex items-center gap-3 rounded-xl cursor-default transition-all bg-surface text-primary border border-secondary/15 shadow-sm hover:border-tertiary/30"
                  >
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-tertiary" />
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Pillars Section */}
        <section className="mt-20 md:mt-32 w-full mx-auto px-2 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-primary">
              Built for <span className="text-tertiary">real workflows</span>
            </h2>
            <p className="mt-6 text-xl max-w-2xl mx-auto text-secondary">
              Everything is designed to keep hiring and collaboration simple,
              transparent, and remarkably fast.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {pillars.map((pillar, index) => (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="surface-card-hover p-6 md:p-10 relative group overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-tertiary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="w-14 h-14 rounded-xl bg-surface border border-secondary/15 shadow-sm flex items-center justify-center mb-6 group-hover:-translate-y-1 transition-transform duration-300">
                  {pillar.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 tracking-tight text-primary">
                  {pillar.title}
                </h3>
                <p className="leading-relaxed text-base text-secondary">
                  {pillar.description}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-32 w-full xl:w-[80%] mx-auto px-4"
        >
          <div className="relative rounded-3xl overflow-hidden p-8 md:p-20 text-center bg-primary border border-primary/20 shadow-lg">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 md:mb-6 tracking-tight leading-tight">
                Ready to build your freelance career?
              </h2>
              <p className="text-base md:text-2xl mb-8 md:mb-12 max-w-2xl mx-auto font-medium text-white/80">
                Join thousands of professionals shipping real projects with the
                perfect team.
              </p>
              {user ? (
                <Link
                  to="/discover"
                  className="btn-primary bg-tertiary hover:bg-tertiary/90 text-white text-lg px-10 py-4 shadow-md inline-block"
                >
                  Explore Opportunities Now
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="btn-primary bg-tertiary hover:bg-tertiary/90 text-white text-lg px-10 py-4 shadow-md inline-block"
                >
                  Create Your Free Account
                </Link>
              )}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
