import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { setPageTitle, resetPageTitle } from "../utils/pageTitle";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPageTitle("Reset Password | Skillify");
    return () => resetPageTitle();
  }, []);

  const canSubmit = useMemo(
    () => token && formData.password && formData.confirmPassword,
    [token, formData.password, formData.confirmPassword],
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or expired reset link. Please request a new one.");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword({
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      toast.success(response.message || "Password has been reset! Redirecting to login...");
      if (response.user?.profileComplete) {
        navigate("/dashboard");
      } else {
        navigate("/complete-profile");
      }
    } catch (err) {
      toast.error(err.message || "Failed to reset password. The link may have expired.");
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
              New Password
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Create a new password
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
              {email
                ? `Reset the password for ${email}.`
                : "Use the secure reset link from your email to choose a new password."}
            </p>
          </div>

          <div className="p-8 sm:p-10 bg-surface">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="reset-password-new"
                  className="mb-2 block text-sm font-bold text-slate-705"
                >
                  New password
                </label>
                <input
                  id="reset-password-new"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter a new password"
                  className="input-base"
                />
              </div>

              <div>
                <label
                  htmlFor="reset-password-confirm"
                  className="mb-2 block text-sm font-bold text-slate-705"
                >
                  Confirm password
                </label>
                <input
                  id="reset-password-confirm"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your new password"
                  className="input-base"
                />
              </div>

              <div className="rounded-2xl surface-sunken px-4 py-4 text-sm leading-6 text-secondary font-semibold">
                Use 8 or more characters for a stronger password.
              </div>

              <button
                type="submit"
                disabled={!canSubmit || loading}
                className="btn-primary w-full py-3.5 text-base"
              >
                {loading ? "Resetting password..." : "Reset password"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link
                to="/forgot-password"
                className="text-sm font-bold text-tertiary hover:underline transition-colors"
              >
                Request a new reset link
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
