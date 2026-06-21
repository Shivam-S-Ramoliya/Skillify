import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import EditProfileForm from "../components/profile/EditProfileForm";
import { setPageTitle, resetPageTitle } from "../utils/pageTitle";

export default function CompleteProfile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setPageTitle("Complete Profile | Skillify");
    return () => resetPageTitle();
  }, []);

  const handleSave = (response) => {
    updateUser(response.user);
    toast.success("Profile completed! You're all set to start exploring.");
    if (response.profileComplete) navigate("/dashboard");
  };

  return (
    <div className="page-wrap relative flex items-center justify-center py-10 min-h-[calc(100vh-80px)]">
      <div className="page-container max-w-full md:max-w-[70%] relative z-10 w-full animate-fade-in-up">
        <section className="bg-surface border border-secondary/15 rounded-3xl p-6 md:p-10 shadow-sm">
          <div className="text-center mb-10 border-b border-secondary/15 pb-8">
            <div className="w-16 h-16 mx-auto bg-secondary/5 rounded-2xl flex items-center justify-center text-tertiary mb-6 border border-secondary/10 shadow-sm">
              <svg
                className="w-8 h-8"
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
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">
              Complete your <span className="text-tertiary">Profile</span>
            </h1>
            <p className="mt-3 md:mt-4 text-sm md:text-lg font-semibold text-secondary">
              Add your details so clients can discover you and hire you for
              their projects.
            </p>
          </div>

          <div className="bg-surface p-6 md:p-8 rounded-xl border border-secondary/10 relative z-10">
            <EditProfileForm
              initialData={user}
              onSave={handleSave}
              submitLabel="Save & Complete Profile"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
