import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { setPageTitle, resetPageTitle } from "../utils/pageTitle";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setPageTitle("Login | Skillify");
    return () => resetPageTitle();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      toast.warning("Email address is required.");
      return;
    }

    if (!formData.password.trim()) {
      toast.warning("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const response = await login(formData);
      toast.success("Welcome back! Logged in successfully.");
      if (response?.user?.profileComplete) navigate("/dashboard");
      else navigate("/complete-profile");
    } catch (err) {
      toast.error(err.message || "Unable to log in. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap flex items-center justify-center min-h-[calc(100vh-160px)]">
      <div className="w-full max-w-full md:max-w-[75%] px-2 md:px-4">
        <div
          className="overflow-hidden rounded-3xl bg-surface shadow-sm grid lg:grid-cols-2 border border-secondary/15 p-3"
        >
          {/* Decorative Section */}
          <div
            className="relative hidden w-full flex-col items-start justify-center p-12 lg:flex text-white overflow-hidden rounded-2xl bg-primary"
          >
            <div className="relative z-10 w-full animate-fade-in-up">
              <span
                className="inline-block rounded-xl px-4 py-1.5 text-xs font-bold tracking-wide mb-6 bg-white/20 border border-white/30 uppercase"
              >
                Welcome Back
              </span>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                Continue your workflow
              </h1>
              <p
                className="text-lg max-w-md mb-8 leading-relaxed opacity-90"
              >
                Log in and pick up where you left off. Discover jobs, connect
                with clients, and ship real projects.
              </p>

              <div className="space-y-4 text-sm font-medium">
                <div
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/10 border border-white/10"
                >
                  <div
                    className="p-3 rounded-xl bg-white/20"
                  >
                    <svg
                      className="w-5 h-5"
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
                  <p className="text-white/90">
                    Discover active opportunities
                  </p>
                </div>
                <div
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/10 border border-white/10"
                >
                  <div
                    className="p-3 rounded-xl bg-white/20"
                  >
                    <svg
                      className="w-5 h-5"
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
                  <p className="text-white/90">
                    Apply with your profile instantly
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="flex w-full flex-col justify-center p-8 sm:p-12 lg:p-16 animate-fade-in z-10 bg-surface">
            <div className="mx-auto w-full max-w-md">
              <div className="text-center mb-10">
                <h2
                  className="text-3xl font-bold tracking-tight text-primary"
                >
                  Sign in
                </h2>
                <p
                  className="mt-2 text-sm font-semibold text-secondary"
                >
                  Access your Skillify account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="login-email"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Email address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="input-base"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="login-password"
                      className="block text-sm font-bold text-slate-700"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-bold text-tertiary hover:underline transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="input-base pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-secondary/70 hover:text-primary transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3.5 text-base relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white/90"
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
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </span>
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center space-y-3">
                <p
                  className="text-sm font-medium text-secondary"
                >
                  New to Skillify?{" "}
                  <Link
                    to="/signup"
                    className="font-bold text-tertiary hover:underline transition-colors"
                  >
                    Create an account
                  </Link>
                </p>
                <p
                  className="text-sm font-medium text-secondary"
                >
                  Need to verify your email?{" "}
                  <Link
                    to="/verify-email"
                    className="font-bold text-tertiary hover:underline transition-colors"
                  >
                    Verify now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
