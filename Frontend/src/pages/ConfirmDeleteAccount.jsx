import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { setPageTitle, resetPageTitle } from "../utils/pageTitle";

export default function ConfirmDeleteAccount() {
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [loading, setLoading] = useState(Boolean(token));
  const [status, setStatus] = useState("processing");
  const deletionAttemptedRef = useRef(false);

  useEffect(() => {
    setPageTitle("Confirm Deletion | Skillify");
    return () => resetPageTitle();
  }, []);

  useEffect(() => {
    if (deletionAttemptedRef.current) return;
    deletionAttemptedRef.current = true;

    if (!token) {
      setLoading(false);
      setStatus("missing");
      toast.error(
        "Invalid or expired deletion link. Please request a new one from your profile.",
      );
      return;
    }

    let cancelled = false;

    const confirmDeletion = async () => {
      try {
        const response = await api.deleteAccount(token);
        if (cancelled) return;
        setStatus("success");
        toast.success(response.message || "Your account has been deleted. We're sorry to see you go.");
        setTimeout(() => {
          logout();
          navigate("/", { replace: true });
        }, 1800);
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        toast.error(err.message || "Could not delete your account. The link may have expired.");
        setLoading(false);
      }
    };

    confirmDeletion();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="page-wrap relative flex items-center justify-center min-h-[calc(100vh-160px)] py-12">
      <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-error-50 blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent-100 blur-3xl opacity-35 pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl px-4">
        <div className="overflow-hidden rounded-3xl border border-secondary/15 bg-surface shadow-2xl shadow-red-500/10">
          <div
            className="px-8 py-10 text-white"
            style={{
              background:
                "linear-gradient(135deg, #b91c1c 0%, #dc2626 48%, #e11d48 100%)",
            }}
          >
            <span className="inline-flex rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-white/15">
              Account Deletion
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Confirming your deletion request
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
              Skillify is processing your secure deletion link.
            </p>
          </div>

          <div className="p-8 sm:p-10">
            {loading && status === "processing" && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 flex items-center gap-3">
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
                Deleting your account...
              </div>
            )}

            {status === "success" && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                Account deleted. Redirecting...
              </div>
            )}

            {status === "missing" && (
              <div className="space-y-4">
                <p className="text-sm leading-6 text-slate-600">
                  The deletion link is missing or incomplete. Request a new link
                  from your profile settings.
                </p>
                <Link
                  to="/profile"
                  className="btn-primary w-full py-3.5 text-base block text-center"
                >
                  Back to Profile
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <p className="text-sm leading-6 text-slate-600">
                  Failed to delete your account. The link may have expired.
                </p>
                <Link
                  to="/profile"
                  className="btn-primary w-full py-3.5 text-base block text-center"
                >
                  Back to Profile
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
