import { useEffect, useRef, useState } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { setPageTitle, resetPageTitle } from "../utils/pageTitle";
import { useToast } from "../context/ToastContext";

let lastPublishPrivateWarningAt = 0;
const PRIVATE_WARNING_COOLDOWN_MS = 1500;

export default function PublishJob() {
  const { user } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    jobName: "",
    githubRepoUrl: "",
    jobDetails: "",
    skillsRequired: "",
    experienceRequired: "",
    compensationType: "paid",
    salary: "",
    durationFrom: "",
    durationTo: "",
    closingDate: "",
  });
  const [jobDescriptionDocument, setJobDescriptionDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const isPublicProfile = user?.profileVisibility === "public";
  const privateWarningShownRef = useRef(false);

  useEffect(() => {
    setPageTitle("Publish Job | Skillify");
    return () => resetPageTitle();
  }, []);

  useEffect(() => {
    if (!isPublicProfile) {
      const now = Date.now();
      if (!privateWarningShownRef.current && now - lastPublishPrivateWarningAt > PRIVATE_WARNING_COOLDOWN_MS) {
        toast.warning("Your profile must be Public to publish jobs. Update it in your profile settings.");
        privateWarningShownRef.current = true;
        lastPublishPrivateWarningAt = now;
      }
      return;
    }
    privateWarningShownRef.current = false;
  }, [isPublicProfile]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPublicProfile) {
      toast.warning("Your profile must be Public to publish jobs. Update it in your profile settings.");
      return;
    }

    // Client-side date validations
    if (
      formData.durationFrom &&
      formData.durationTo &&
      formData.durationFrom >= formData.durationTo
    ) {
      toast.error("The job start date must be before the end date.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (formData.closingDate && formData.closingDate < today) {
      toast.error("The application deadline cannot be in the past.");
      return;
    }

    if (
      formData.closingDate &&
      formData.durationFrom &&
      formData.closingDate >= formData.durationFrom
    ) {
      toast.error("The application deadline must be before the job start date.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        skillsRequired: formData.skillsRequired
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      const response = await api.publishJob(payload, jobDescriptionDocument);
      if (response.success) {
        toast.success("🎉 Job published! It's now live and visible to freelancers.");
        setFormData({
          jobName: "",
          githubRepoUrl: "",
          jobDetails: "",
          skillsRequired: "",
          experienceRequired: "",
          compensationType: "paid",
          salary: "",
          durationFrom: "",
          durationTo: "",
          closingDate: "",
        });
        setJobDescriptionDocument(null);
      }
    } catch (err) {
      toast.error(err.message || "Could not publish your job. Please check all fields and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap relative">
      <div className="page-container relative z-10">
        <section className="bg-surface border border-secondary/15 rounded-2xl p-5 md:p-12 shadow-sm">
          <div className="text-center mb-12">
            <div className="mx-auto w-16 h-16 bg-secondary/5 border border-secondary/10 rounded-2xl flex items-center justify-center mb-6 text-tertiary shadow-sm">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h1 className="text-2xl md:text-5xl font-extrabold tracking-tight text-primary mb-3 md:mb-4">
              Publish a <span className="text-tertiary">Job</span>
            </h1>
            <p className="text-sm md:text-lg font-semibold text-secondary max-w-2xl mx-auto">
              Create a high-quality listing to attract the best freelancers and
              open contributors.
            </p>
          </div>

          {!isPublicProfile ? (
            <div className="alert-error mb-8 flex items-center gap-3 animate-fade-in-up font-bold">
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Your profile is private. Switch visibility to Public from your
              profile page to publish jobs.
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="bg-surface p-5 md:p-8 rounded-2xl border border-secondary/15 space-y-6">
                  <h2 className="text-xl font-bold text-primary flex items-center gap-2.5 mb-4 border-b border-secondary/15 pb-4">
                    <span className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center text-sm font-bold border border-tertiary/15">
                      1
                    </span>
                    Basic Details
                  </h2>
                  <div>
                    <label className="mb-2.5 block text-sm font-bold text-slate-700">
                      Job Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="jobName"
                      value={formData.jobName}
                      onChange={handleChange}
                      required
                      className="input-base"
                      placeholder="e.g. Frontend Developer for SaaS Dashboard"
                    />
                  </div>

                  <div>
                    <label className="mb-2.5 block text-sm font-bold text-slate-700">
                      Work GitHub Repo (optional)
                    </label>
                    <input
                      type="url"
                      name="githubRepoUrl"
                      value={formData.githubRepoUrl}
                      onChange={handleChange}
                      className="input-base"
                      placeholder="https://github.com/org/repo"
                    />
                  </div>

                  <div>
                    <label className="mb-2.5 block text-sm font-bold text-slate-700">
                      Specific Job Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="jobDetails"
                      value={formData.jobDetails}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="input-base resize-y"
                      placeholder="Describe the scope, responsibilities, and expected outcomes..."
                    />
                  </div>
                </div>

                <div className="bg-surface p-5 md:p-8 rounded-2xl border border-secondary/15 space-y-6">
                  <h2 className="text-xl font-bold text-primary flex items-center gap-2.5 mb-4 border-b border-secondary/15 pb-4">
                    <span className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center text-sm font-bold border border-tertiary/15">
                      2
                    </span>
                    Requirements
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2.5 block text-sm font-bold text-slate-700">
                        Skills Required <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="skillsRequired"
                        value={formData.skillsRequired}
                        onChange={handleChange}
                        required
                        className="input-base"
                        placeholder="React, TypeScript, API integration"
                      />
                      <p className="text-xs text-slate-500 mt-2 font-semibold">
                        Comma separated list of skills.
                      </p>
                    </div>
                    <div>
                      <label className="mb-2.5 block text-sm font-bold text-slate-700">
                        Experience Required <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="experienceRequired"
                        value={formData.experienceRequired}
                        onChange={handleChange}
                        required
                        className="input-base"
                        placeholder="e.g. 2+ years"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-surface p-5 md:p-8 rounded-2xl border border-secondary/15 space-y-6">
                  <h2 className="text-xl font-bold text-primary flex items-center gap-2.5 mb-4 border-b border-secondary/15 pb-4">
                    <span className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center text-sm font-bold border border-tertiary/15">
                      3
                    </span>
                    Terms & Attachments
                  </h2>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2.5 block text-sm font-bold text-slate-700">
                        Compensation <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="compensationType"
                          value={formData.compensationType}
                          onChange={handleChange}
                          className="input-base appearance-none pr-10"
                          required
                        >
                          <option value="paid">Paid</option>
                          <option value="unpaid">
                            Unpaid / Open Source Contribution
                          </option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
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
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2.5 block text-sm font-bold text-slate-700">
                        Salary{" "}
                        {formData.compensationType === "paid" ? (
                          <span className="text-tertiary">*</span>
                        ) : (
                          <span className="text-slate-400 font-semibold">
                            (optional)
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        required={formData.compensationType === "paid"}
                        disabled={formData.compensationType === "unpaid"}
                        className="input-base disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={
                          formData.compensationType === "paid"
                            ? "e.g. ₹40,000/month or $50/hr"
                            : "Not applicable"
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
                    <div>
                      <label className="mb-2.5 block text-sm font-bold text-slate-700">
                        Job Duration From <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="durationFrom"
                        value={formData.durationFrom}
                        onChange={handleChange}
                        required
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="mb-2.5 block text-sm font-bold text-slate-700">
                        Job Duration To <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="durationTo"
                        value={formData.durationTo}
                        onChange={handleChange}
                        required
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="mb-2.5 block text-sm font-bold text-slate-700">
                        Applications Closing Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="closingDate"
                        value={formData.closingDate}
                        onChange={handleChange}
                        required
                        className="input-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2.5 block text-sm font-bold text-slate-700">
                      Job Description Document (optional)
                    </label>
                    <div className="relative mt-3 flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-slate-300/60 border-dashed rounded-xl cursor-pointer bg-surface hover:bg-secondary/5 hover:border-tertiary/50 transition-all duration-200">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-8 h-8 mb-3 text-tertiary opacity-80"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            ></path>
                          </svg>
                          <p className="mb-1 text-sm text-primary font-bold">
                            <span className="text-tertiary">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-secondary font-semibold">
                            PDF, DOCX, TXT, or MD (MAX 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt,.md"
                          onChange={(e) =>
                            setJobDescriptionDocument(
                              e.target.files?.[0] || null,
                            )
                          }
                        />
                      </label>
                    </div>
                    {jobDescriptionDocument && (
                      <div className="mt-4 flex items-center justify-between p-3.5 rounded-xl bg-success-50 border border-success-700/20 shadow-sm animate-fade-in">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-success-700/10 flex items-center justify-center text-success-700">
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <span className="text-sm font-bold text-success-700">
                            {jobDescriptionDocument.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setJobDescriptionDocument(null)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-error-750 hover:bg-error-50 border border-error-200 transition-all duration-200"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3.5 text-base font-bold uppercase tracking-wider group"
                  >
                    <span className="flex items-center justify-center gap-2">
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
                          Publishing to Network...
                        </>
                      ) : (
                        <>
                          Publish Job Now
                          <svg
                            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                  <p className="text-center text-xs text-secondary font-semibold mt-4">
                    By publishing, you agree to our terms of service.
                  </p>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
