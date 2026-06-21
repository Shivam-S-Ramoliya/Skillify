import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { setPageTitle, resetPageTitle } from "../utils/pageTitle";

export default function VerifyEmail() {
  const { verifyEmail, checkVerification, resendVerification } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultEmail = searchParams.get("email") || "";
  const defaultToken =
    searchParams.get("token") || searchParams.get("code") || "";

  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const verificationAttempted = useRef(false);

  useEffect(() => {
    setPageTitle("Verify Email | Skillify");
    return () => resetPageTitle();
  }, []);

  // Auto-verify if a signed token comes from the URL (clicked email link)
  useEffect(() => {
    if (!defaultToken || verificationAttempted.current) return;
    
    verificationAttempted.current = true;

    const autoVerify = async () => {
      setLoading(true);
      try {
        const response = await verifyEmail(defaultToken);
        toast.success(response.message || "Email verified! Welcome to Skillify.");
        if (response.user?.profileComplete) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/complete-profile", { replace: true });
        }
      } catch (err) {
        // If already verified, treat as success and try to log them in
        if (err.message?.toLowerCase().includes("already verified")) {
          toast.info("Your email is already verified. Redirecting...");
          // Try to check verification to get auth token
          if (defaultEmail) {
            try {
              const checkResponse = await checkVerification(defaultEmail);
              if (checkResponse.user?.profileComplete) {
                navigate("/dashboard", { replace: true });
              } else {
                navigate("/complete-profile", { replace: true });
              }
              return;
            } catch {
              // If check fails, just redirect to login
              navigate("/login", { replace: true });
              return;
            }
          }
          navigate("/login", { replace: true });
        } else {
          toast.error(err.message || "Email verification failed. Please try again.");
          setLoading(false);
        }
      }
    };

    autoVerify();
  }, [defaultToken]); // Only depend on token - runs once

  const handleCheckVerification = async () => {
    if (!email.trim()) {
      toast.warning("Please enter your email address to check status.");
      return;
    }

    setLoading(true);
    try {
      const response = await checkVerification(email.trim());
      toast.success(response.message || "Email is verified! You can log in now.");
      if (response.user?.profileComplete) {
        navigate("/dashboard");
      } else {
        navigate("/complete-profile");
      }
    } catch (err) {
      toast.error(err.message || "Email is not verified yet. Please check your inbox.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      toast.warning("Please enter your email address to resend verification.");
      return;
    }

    setResendLoading(true);
    try {
      const response = await resendVerification(email.trim());
      toast.success(response.message || "Verification email sent! Check your inbox.");
    } catch (err) {
      toast.error(err.message || "Could not resend verification email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="page-wrap flex items-center justify-center min-h-[calc(100vh-160px)] py-12">
      <div className="w-full max-w-xl px-4">
        <div className="overflow-hidden rounded-3xl border border-secondary/15 bg-surface shadow-sm animate-fade-in-up relative p-3">
          <div className="p-8 sm:p-12 relative z-10">
            <div className="text-center mb-10">
              <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-5 surface-sunken">
                <svg
                  className="w-8 h-8 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-primary tracking-tight">
                Verify your email
              </h2>
              <p className="mt-3 text-base font-semibold text-secondary">
                We've sent a verification link to your email. Click it to verify, then come back here.
              </p>
            </div>

            {/* Email input */}
            <div className="mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-base text-center text-lg font-bold py-5"
              />
            </div>

            {/* Action buttons */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleCheckVerification}
                disabled={loading || !email.trim()}
                className="btn-primary w-full py-4 text-lg tracking-wide shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
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
                    Checking...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    I've Verified My Email
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading || !email.trim()}
                className="btn-secondary w-full py-4 text-lg"
              >
                {resendLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
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
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Resend Verification Link
                  </span>
                )}
              </button>
            </div>

            <div className="mt-10 pt-8 border-t border-secondary/15 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-tertiary hover:underline transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
