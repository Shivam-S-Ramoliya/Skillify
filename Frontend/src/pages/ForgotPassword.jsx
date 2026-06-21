import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { setPageTitle, resetPageTitle } from "../utils/pageTitle";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPageTitle("Forgot Password | Skillify");
    return () => resetPageTitle();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await forgotPassword(email.trim());
      toast.success(
        response.message ||
          "If an account exists for that email, a reset link has been sent.",
      );
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap relative flex items-center justify-center min-h-[calc(100vh-160px)] py-12">
      <div className="relative z-10 w-full max-w-2xl px-4">
        <div className="overflow-hidden rounded-3xl border border-secondary/15 bg-surface shadow-sm p-3">
          <div
            className="px-8 py-10 text-white rounded-2xl bg-primary"
          >
            <span
              className="inline-flex rounded-xl px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-white/20 border border-white/30"
            >
              Password Reset
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Send yourself a new sign-in link
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
              Enter the email attached to your Skillify account and we will send
              a secure reset link right away.
            </p>
          </div>

          <div className="p-8 sm:p-10 bg-surface">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="forgot-password-email"
                  className="mb-2 block text-sm font-bold text-slate-705"
                >
                  Email address
                </label>
                <input
                  id="forgot-password-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="input-base"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="btn-primary w-full py-3.5 text-base"
              >
                {loading ? "Sending reset link..." : "Send reset link"}
              </button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-3 text-center">
              <p className="text-sm font-medium text-secondary">
                Remembered your password?{" "}
                <Link
                  to="/login"
                  className="font-bold text-tertiary hover:underline transition-colors"
                >
                  Back to login
                </Link>
              </p>
              <p className="text-xs leading-6 text-secondary/70">
                The reset link is sent by email and expires after one hour.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
