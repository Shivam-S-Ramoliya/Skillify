/* eslint-disable react/prop-types, no-negated-condition */
import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useToast } from "../../context/ToastContext";

export default function DeleteAccountModal({ isOpen, onClose }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
      setSent(false);
    }
  }, [isOpen]);

  const handleSendLink = async () => {
    setLoading(true);

    try {
      await api.requestAccountDeletion();
      setSent(true);
      toast.success("Confirmation link sent to your email!");
    } catch (err) {
      toast.error(err.message || "Failed to send confirmation link");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <button
        type="button"
        aria-label="Close delete account modal"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      ></button>

      <div className="relative w-full max-w-md glass-card border border-white/60 shadow-2xl p-8 animate-fade-in-up">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center mb-5">
              <svg
                className="w-8 h-8 text-emerald-600"
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
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Confirmation Link Sent
            </h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Check your email and open the confirmation link to permanently
              delete your account.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-primary mt-6 w-full py-3.5 text-base"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-2xl flex items-center justify-center mb-5">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Delete Your Account?
              </h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                This action is{" "}
                <strong className="text-red-600">
                  permanent and irreversible
                </strong>
                . We’ll send a secure confirmation link to your email.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 space-y-2">
              {[
                "Your profile and personal information",
                "All job posts you've published",
                "All applications (sent & received)",
                "Uploaded files (resume, profile picture)",
              ].map((item) => (
                <p
                  key={item}
                  className="flex items-start gap-2 text-sm text-red-800 font-medium"
                >
                  <svg
                    className="w-4 h-4 text-red-500 mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  {item}
                </p>
              ))}
            </div>

            <p className="text-xs text-slate-500 font-medium text-center mb-6">
              We’ll send a secure confirmation link to your email to confirm.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary w-1/3 py-3"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendLink}
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-xs font-semibold text-white bg-linear-to-r from-red-600 to-rose-600 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
              >
                {loading ? "Sending..." : "Send Confirmation Link"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
