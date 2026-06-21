import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  Home,
  LogIn,
  Compass,
  LayoutDashboard,
  PlusCircle,
  FileText,
  User,
} from "lucide-react";

const guestLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/login", label: "Login", icon: LogIn },
];

const linkClass = ({ isActive }) =>
  `relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-all duration-200 ${
    isActive
      ? "text-tertiary bg-tertiary/10"
      : "text-secondary hover:text-primary hover:bg-secondary/5"
  }`;

export default function NavBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/login");
  };

  const closeMobile = () => setMobileOpen(false);

  const authLinks = [
    { to: "/discover", label: "Discover", icon: Compass },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/publish-job", label: "Publish", icon: PlusCircle },
    { to: "/applications", label: "Applications", icon: FileText },
    { to: user?.username ? `/profile/${user.username}` : "/profile", label: "Profile", icon: User },
  ];

  const links = user ? authLinks : guestLinks;

  return (
    <>
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-secondary/15">
        <nav className="page-container relative z-10">
          <div className="flex h-[4.5rem] items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden bg-transparent transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/Skillify.png"
                  alt="Skillify"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <p className="text-xl font-extrabold tracking-tight transition-colors duration-300 text-primary group-hover:text-tertiary">
                  Skillify
                </p>
                <p className="text-[11px] font-bold leading-none tracking-wider uppercase text-secondary">
                  Freelancer Network
                </p>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden items-center gap-1 md:flex p-1 rounded-xl bg-secondary/5 border border-secondary/10">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass} end>
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Desktop right actions */}
            <div className="hidden md:flex items-center gap-4">
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-lg p-2.5 transition-all text-secondary hover:text-primary hover:bg-secondary/5 border border-secondary/20 bg-surface focus:outline-none cursor-pointer flex items-center justify-center"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4.5 w-4.5" />
                ) : (
                  <Moon className="h-4.5 w-4.5" />
                )}
              </button>
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg border border-secondary px-4 py-2 text-sm font-bold text-primary hover:bg-secondary/5 hover:text-error-700 hover:border-error-700 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              ) : (
                <Link to="/signup" className="btn-primary py-2 px-5 text-sm">
                  Sign Up
                </Link>
              )}
            </div>

            {/* Mobile right actions */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-lg p-2 transition-all text-secondary hover:text-primary border border-secondary/20 bg-surface focus:outline-none cursor-pointer flex items-center justify-center"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              {user ? (
                /* Logout icon for auth mobile */
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg p-2 transition-all text-secondary hover:text-error-700 border border-secondary/20 bg-surface focus:outline-none cursor-pointer flex items-center justify-center"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              ) : (
                /* Hamburger for guest mobile */
                <button
                  type="button"
                  onClick={() => setMobileOpen((prev) => !prev)}
                  className="rounded-lg p-2 transition-all text-secondary hover:text-primary border border-secondary/20 bg-surface focus:outline-none cursor-pointer flex items-center justify-center"
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Guest mobile dropdown (only for guests) */}
          <AnimatePresence>
            {mobileOpen && !user && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="md:hidden overflow-hidden border border-secondary/15 bg-surface rounded-2xl shadow-lg mt-2 mb-4"
              >
                <div className="space-y-1.5 pb-6 pt-4 px-4">
                  {guestLinks.map((link, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      key={link.to}
                    >
                      <NavLink
                        to={link.to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-4 py-2.5 text-base font-bold transition-all duration-200 ${
                            isActive
                              ? "text-tertiary bg-tertiary/10"
                              : "text-secondary hover:text-primary hover:bg-secondary/5"
                          }`
                        }
                        onClick={closeMobile}
                        end
                      >
                        <link.icon className="w-5 h-5" />
                        <span>{link.label}</span>
                      </NavLink>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: guestLinks.length * 0.03 }}
                    className="pt-4 mt-4 border-t border-secondary/15"
                  >
                    <Link
                      to="/signup"
                      onClick={closeMobile}
                      className="flex w-full justify-center btn-primary py-3 text-base"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      {/* Fixed bottom tab bar for authenticated mobile users */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface/95 backdrop-blur-md border-t border-secondary/15 safe-area-bottom">
          <div className="flex items-center justify-around h-16 px-1">
            {authLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-tertiary"
                      : "text-secondary"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <link.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                    <span className={`text-[10px] font-bold leading-tight ${isActive ? "text-tertiary" : "text-secondary/70"}`}>
                      {link.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
