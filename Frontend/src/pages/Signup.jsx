import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { City, Country, State } from "country-state-city";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { setPageTitle, resetPageTitle } from "../utils/pageTitle";

export default function Signup() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    location: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [selectedCityName, setSelectedCityName] = useState("");

  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(
    () =>
      selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : [],
    [selectedCountryCode],
  );
  const cities = useMemo(() => {
    if (!selectedCountryCode) return [];

    if (selectedStateCode) {
      return (
        City.getCitiesOfState(selectedCountryCode, selectedStateCode) || []
      );
    }

    if (typeof City.getCitiesOfCountry === "function") {
      return City.getCitiesOfCountry(selectedCountryCode) || [];
    }

    return [];
  }, [selectedCountryCode, selectedStateCode]);

  const getPasswordChecks = (password) => {
    const checks = [
      {
        label: "8-50 characters",
        ok: password.length >= 8 && password.length <= 50,
      },
      { label: "At least 1 uppercase", ok: /[A-Z]/.test(password) },
      { label: "At least 1 lowercase", ok: /[a-z]/.test(password) },
      { label: "At least 1 number", ok: /\d/.test(password) },
      {
        label: "At least 1 symbol",
        ok: /[^A-Za-z0-9\s_-]/.test(password),
      },
      {
        label: "No spaces, underscores, or dashes",
        ok: !/[\s_-]/.test(password),
      },
    ];

    return checks;
  };

  useEffect(() => {
    setPageTitle("Sign Up | Skillify");
    return () => resetPageTitle();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (!selectedCountryCode) return;

    const countryName =
      countries.find((country) => country.isoCode === selectedCountryCode)
        ?.name || "";
    const stateName =
      states.find((state) => state.isoCode === selectedStateCode)?.name || "";

    const parts = [];
    if (selectedCityName) parts.push(selectedCityName);
    if (stateName) parts.push(stateName);
    if (countryName) parts.push(countryName);

    setFormData((prev) => ({ ...prev, location: parts.join(", ") }));
  }, [
    selectedCountryCode,
    selectedStateCode,
    selectedCityName,
    countries,
    states,
  ]);

  const handleCountryChange = (e) => {
    const nextCountryCode = e.target.value;
    setSelectedCountryCode(nextCountryCode);
    setSelectedStateCode("");
    setSelectedCityName("");
  };

  const handleStateChange = (e) => {
    const nextStateCode = e.target.value;
    setSelectedStateCode(nextStateCode);
    setSelectedCityName("");
  };

  const handleCityChange = (e) => {
    setSelectedCityName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.warning("Full name is required.");
      return;
    }

    if (!formData.username.trim()) {
      toast.warning("Username is required.");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      toast.error("Username can only contain letters, numbers, and underscores — no spaces.");
      return;
    }

    if (!formData.email.trim()) {
      toast.warning("Email address is required.");
      return;
    }

    if (!formData.password) {
      toast.warning("Password is required.");
      return;
    }

    if (!formData.confirmPassword) {
      toast.warning("Please confirm your password.");
      return;
    }

    setLoading(true);

    if (formData.name.length > 100) {
      toast.error("Name must be 100 characters or less.");
      setLoading(false);
      return;
    }

    if (!formData.location) {
      toast.error("Location is required. Please select your country, state, and city.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8 || formData.password.length > 50) {
      toast.error("Password must be between 8 and 50 characters.");
      setLoading(false);
      return;
    }

    const passwordChecks = getPasswordChecks(formData.password);
    const failedChecks = passwordChecks.filter((check) => !check.ok);
    if (failedChecks.length > 0) {
      toast.error(
        `Password missing: ${failedChecks
          .map((check) => check.label)
          .join(", ")}`,
      );
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const response = await signup(formData);
      if (response.success) {
        toast.success(response.message);
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (err) {
      toast.error(err.message || "Signup failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap flex items-center justify-center min-h-[calc(100vh-160px)] py-12">
      <div className="w-full max-w-full md:max-w-[75%] px-2 md:px-4">
        <div
          className="overflow-hidden rounded-3xl bg-surface shadow-sm grid lg:grid-cols-5 border border-secondary/15 p-3"
        >
          {/* Form Section (col-span-3) */}
          <div className="flex w-full flex-col justify-center p-8 sm:p-10 lg:p-12 animate-fade-in z-10 bg-surface lg:col-span-3 lg:order-2">
            <div className="mx-auto w-full max-w-lg">
              <div className="text-center mb-8">
                <h2
                  className="text-3xl font-bold tracking-tight text-primary"
                >
                  Create an account
                </h2>
                <p
                  className="mt-2 text-sm font-semibold text-secondary"
                >
                  Join Skillify and build your freelance career.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    className="mb-2 block text-sm font-bold text-slate-705"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    placeholder="John Doe"
                    className="input-base"
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-bold text-slate-705"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="john_doe"
                    className="input-base"
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-bold text-slate-705"
                  >
                    Email Address
                  </label>
                  <input
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
                  <label
                    className="mb-2 block text-sm font-bold text-slate-705"
                  >
                    Location
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={selectedCountryCode}
                      onChange={handleCountryChange}
                      required
                      className="input-base px-3 py-3"
                    >
                      <option value="">Country</option>
                      {countries.map((country) => (
                        <option key={country.isoCode} value={country.isoCode}>
                          {country.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedStateCode}
                      onChange={handleStateChange}
                      required={states.length > 0}
                      disabled={!selectedCountryCode || states.length === 0}
                      className="input-base px-3 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {selectedCountryCode
                          ? states.length > 0
                            ? "State"
                            : "No States"
                          : "State"}
                      </option>
                      {states.map((state) => (
                        <option key={state.isoCode} value={state.isoCode}>
                          {state.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedCityName}
                      onChange={handleCityChange}
                      required={cities.length > 0}
                      disabled={!selectedCountryCode || cities.length === 0}
                      className="input-base px-3 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {selectedCountryCode
                          ? cities.length > 0
                            ? "City"
                            : "No Cities"
                          : "City"}
                      </option>
                      {cities.map((city, index) => (
                        <option
                          key={`${city.name}-${city.stateCode || ""}-${index}`}
                          value={city.name}
                        >
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p
                    className="text-xs font-semibold mt-2 text-secondary"
                  >
                    Selected: {formData.location || "-"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      className="mb-2 block text-sm font-bold text-slate-705"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        maxLength={50}
                        placeholder="••••••••"
                        className="input-base pr-16"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center transition-colors text-secondary/70 hover:text-primary"
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

                  <div>
                    <label
                      className="mb-2 block text-sm font-bold text-slate-705"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength={8}
                        maxLength={50}
                        placeholder="••••••••"
                        className="input-base pr-16"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center transition-colors text-secondary/70 hover:text-primary"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
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
                </div>

                <div
                  className="space-y-1.5 p-4 rounded-xl mb-2 surface-sunken"
                >
                  <p
                    className="text-xs font-bold mb-2 uppercase tracking-wide text-primary"
                  >
                    Password requirements:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {getPasswordChecks(formData.password).map((check) => (
                      <div
                        key={check.label}
                        className={`text-xs flex items-center gap-1.5 font-bold ${
                          check.ok ? "text-success-700" : "text-secondary/70"
                        }`}
                      >
                        {check.ok ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <span className="w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                            •
                          </span>
                        )}
                        <span>{check.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-4 text-base relative overflow-hidden group"
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
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </span>
                  </button>
                </div>
              </form>

              <div
                className="mt-8 text-center p-4 rounded-xl surface-sunken"
              >
                <p
                  className="text-sm font-semibold text-secondary"
                >
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold transition-colors ml-1 text-tertiary hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Decorative Section (col-span-2) */}
          <div
            className="relative hidden w-full flex-col items-center justify-center p-12 lg:flex text-white overflow-hidden lg:col-span-2 lg:order-1 rounded-2xl bg-primary animate-fade-in"
          >
            <div className="relative z-10 w-full text-center animate-fade-in-up">
              <div
                className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-8 bg-white/20 border border-white/20 shadow-sm"
              >
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Join our network
              </h1>
              <p
                className="text-base max-w-sm mx-auto leading-relaxed mb-8 opacity-90"
              >
                Connect with clients and discover high-quality projects. Build
                your career by shipping real work with the perfect team.
              </p>

              <div
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-white/20 border border-white/30 uppercase"
              >
                <span
                  className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                ></span>
                Thousands of active jobs
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
