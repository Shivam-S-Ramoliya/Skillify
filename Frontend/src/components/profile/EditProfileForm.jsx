import { useEffect, useMemo, useState } from "react";
import { City, Country, State } from "country-state-city";
import { api } from "../../utils/api";
import { useToast } from "../../context/ToastContext";

export default function EditProfileForm({
  initialData,
  onSave,
  onCancel,
  submitLabel = "Save Changes",
}) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    username: initialData?.username || "",
    bio: initialData?.bio || "",
    location: initialData?.location || "",
    profilePicture: initialData?.profilePicture || "",
    resume: initialData?.resume || "",
    availability: initialData?.availability || "part-time",
    education: Array.isArray(initialData?.education)
      ? initialData.education
      : [],
    experience: Array.isArray(initialData?.experience)
      ? initialData.experience
      : [],
    yearsOfExperience: initialData?.yearsOfExperience ?? 0,
    skills: Array.isArray(initialData?.skills)
      ? initialData.skills.join(", ")
      : initialData?.skills || "",
    githubUrl: initialData?.githubUrl || "",
    linkedinUrl: initialData?.linkedinUrl || "",
    portfolioUrl: initialData?.portfolioUrl || "",
    profileVisibility: initialData?.profileVisibility || "private",
  });
  const [loading, setLoading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [picturePreview, setPicturePreview] = useState(
    initialData?.profilePicture || null,
  );
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

  useEffect(() => {
    if (!initialData?.location || !countries.length) return;

    const parts = initialData.location
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    let cityName = "";
    let stateName = "";
    let countryName = "";

    if (parts.length >= 3) {
      cityName = parts[0];
      stateName = parts[1];
      countryName = parts.slice(2).join(", ");
    } else if (parts.length === 2) {
      cityName = parts[0];
      countryName = parts[1];
    } else {
      countryName = parts[0] || "";
    }

    const matchedCountry = countries.find(
      (country) => country.name.toLowerCase() === countryName.toLowerCase(),
    );

    if (!matchedCountry) return;

    setSelectedCountryCode(matchedCountry.isoCode);

    const statesOfCountry =
      State.getStatesOfCountry(matchedCountry.isoCode) || [];
    const matchedState = stateName
      ? statesOfCountry.find(
          (state) => state.name.toLowerCase() === stateName.toLowerCase(),
        )
      : null;

    if (matchedState) {
      setSelectedStateCode(matchedState.isoCode);
    }

    const availableCities = matchedState
      ? City.getCitiesOfState(matchedCountry.isoCode, matchedState.isoCode) ||
        []
      : typeof City.getCitiesOfCountry === "function"
        ? City.getCitiesOfCountry(matchedCountry.isoCode) || []
        : [];

    const matchedCity = cityName
      ? availableCities.find(
          (city) => city.name.toLowerCase() === cityName.toLowerCase(),
        )
      : null;

    if (matchedCity) {
      setSelectedCityName(matchedCity.name);
    }
  }, [initialData?.location, countries]);

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

    const nextLocation = parts.join(", ");

    setFormData((prevData) =>
      prevData.location === nextLocation
        ? prevData
        : { ...prevData, location: nextLocation },
    );
  }, [
    selectedCityName,
    selectedStateCode,
    selectedCountryCode,
    states,
    countries,
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "availability" && value === "not available") {
      toast.warning(
        "Heads up — your profile will show as not available for new opportunities.",
      );
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleArrayChange = (field, index, key, value) => {
    const newArray = [...formData[field]];
    newArray[index] = { ...newArray[index], [key]: value };
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    const newItem =
      field === "education"
        ? {
            school: "",
            degree: "",
            from: "",
            to: "",
            isCurrentlyStudying: false,
          }
        : { company: "", role: "", from: "", to: "" };
    setFormData({ ...formData, [field]: [...formData[field], newItem] });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPicture(true);
    try {
      const response = await api.uploadProfilePicture(file);
      if (response.success) {
        setFormData({ ...formData, profilePicture: response.profilePicture });
        setPicturePreview(response.profilePicture);
        toast.success("Profile picture updated!");
      }
    } catch (err) {
      toast.error(err.message || "Could not upload profile picture. Please try a smaller file.");
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    try {
      const response = await api.uploadResume(file);
      if (response.success) {
        setFormData({ ...formData, resume: response.resume });
        toast.success("Resume uploaded successfully!");
      }
    } catch (err) {
      toast.error(err.message || "Could not upload resume. Please try a different file.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleResumeDownload = async () => {
    if (!formData.resume) return;
    try {
      const response = await fetch(formData.resume);
      if (!response.ok) throw new Error("Failed to download resume");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      const parts = formData.resume.split("/");
      link.download = parts[parts.length - 1] || "resume";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Resume downloaded to your device.");
    } catch (err) {
      toast.error(err.message || "Could not download resume. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.warning("Name is required.");
      return;
    }

    if (!formData.username.trim()) {
      toast.warning("Username is required.");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username.trim())) {
      toast.warning("Username can only contain letters, numbers, and underscores — no spaces.");
      return;
    }

    if (!formData.bio.trim()) {
      toast.warning("Bio is required. Tell others about yourself.");
      return;
    }

    if (!formData.location.trim()) {
      toast.warning("Location is required.");
      return;
    }

    if (!formData.skills.trim()) {
      toast.warning("Add at least one skill to help others find you.");
      return;
    }

    if (!formData.profilePicture) {
      toast.warning("A profile picture is required.");
      return;
    }

    if (!formData.resume) {
      toast.warning("A resume or portfolio document is required.");
      return;
    }

    if (!formData.availability) {
      toast.warning("Please select your availability status.");
      return;
    }

    if (formData.availability === "not available") {
      toast.warning(
        "You selected 'Not Available'. Change your availability to save your profile.",
      );
      return;
    }

    if (formData.education.length === 0) {
      toast.warning("Add at least one education entry.");
      return;
    }

    for (let index = 0; index < formData.education.length; index += 1) {
      const edu = formData.education[index];
      if (!edu.school?.trim()) {
        toast.warning(`Education #${index + 1}: school/college name is required.`);
        return;
      }
      if (!edu.degree?.trim()) {
        toast.warning(`Education #${index + 1}: degree/standard is required.`);
        return;
      }
      if (!edu.from) {
        toast.warning(`Education #${index + 1}: start date is required.`);
        return;
      }
      if (!edu.isCurrentlyStudying && !edu.to) {
        toast.warning(
          `Education #${index + 1}: end date is required, or mark as currently studying.`,
        );
        return;
      }
    }

    if (!formData.githubUrl.trim()) {
      toast.warning("GitHub URL is required.");
      return;
    }

    if (!formData.linkedinUrl.trim()) {
      toast.warning("LinkedIn URL is required.");
      return;
    }

    // Date Validation
    const validateDates = (arr, isEducation = false) => {
      for (const item of arr) {
        if (!item.from) return "Start date is required.";

        // Check if ongoing/current status
        const isOngoing = isEducation
          ? item.isCurrentlyStudying
          : item.to === "Present";
        if (!isOngoing && !item.to)
          return `End date is required, or mark as ${isEducation ? "currently studying" : "present"}.`;

        const fromDate = new Date(item.from);
        const today = new Date();

        if (fromDate > today) return "Start date cannot be in the future.";

        if (!isOngoing) {
          const toDate = new Date(item.to);
          if (toDate > today) return "End date cannot be in the future.";
          if (fromDate > toDate) return "Start date must be before end date.";
        }
      }
      return null;
    };

    const eduError = validateDates(formData.education, true);
    if (eduError) {
      toast.error(`Education: ${eduError}`);
      return;
    }

    for (let index = 0; index < formData.experience.length; index += 1) {
      const exp = formData.experience[index];
      if (!exp.company?.trim()) {
        toast.warning(`Experience #${index + 1}: company name is required.`);
        return;
      }
      if (!exp.role?.trim()) {
        toast.warning(`Experience #${index + 1}: role is required.`);
        return;
      }
      if (!exp.from) {
        toast.warning(`Experience #${index + 1}: start date is required.`);
        return;
      }
      if (!exp.to) {
        toast.warning(
          `Experience #${index + 1}: end date is required, or mark as Present.`,
        );
        return;
      }
    }

    const expError = validateDates(formData.experience, false);
    if (expError) {
      toast.error(`Experience: ${expError}`);
      return;
    }

    if (
      Number(formData.yearsOfExperience) > 0 &&
      formData.experience.length === 0
    ) {
      toast.error(
        "Please add at least one Experience entry, or set your Total Experience to 0.",
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        yearsOfExperience: Number(formData.yearsOfExperience) || 0,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const response = await api.updateProfile(payload);
      if (response.success) {
        toast.success("Profile saved successfully!");
        onSave(response);
      }
    } catch (err) {
      const message = err.message || "Could not save profile. Please try again.";
      if (
        message.includes("open posted jobs") ||
        message.includes("pending applications")
      ) {
        toast.warning(message);
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-sm text-slate-500">
          Fields marked with <span className="text-red-500">*</span> are
          required.
        </p>

        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2.5">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            className="input-base"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2.5">
            Username <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-slate-500 font-bold text-sm">
              @
            </span>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="username"
              className="input-base pl-9"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Only alphanumeric characters and underscores are allowed. No spaces.
          </p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2.5">
            Bio <span className="text-red-500">*</span>
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            placeholder="Tell us about yourself..."
            className="input-base resize-none"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2.5">
            Location <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={selectedCountryCode}
              onChange={handleCountryChange}
              className="input-base"
              required
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.isoCode} value={country.isoCode}>
                  {country.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStateCode}
              onChange={handleStateChange}
              className="input-base disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedCountryCode || states.length === 0}
              required
            >
              <option value="">
                {selectedCountryCode
                  ? states.length > 0
                    ? "Select State"
                    : "No States Available"
                  : "Select Country First"}
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
              className="input-base disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedCountryCode || cities.length === 0}
              required
            >
              <option value="">
                {selectedCountryCode
                  ? cities.length > 0
                    ? "Select City"
                    : "No Cities Available"
                  : "Select Country First"}
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
          <p className="text-xs text-slate-500 mt-2">
            Selected: {formData.location || "-"}
          </p>
        </div>

        {/* Profile Picture */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2.5">
            Profile Picture <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6 items-center">
            {picturePreview && (
              <div className="relative p-2 bg-surface rounded-xl border border-secondary/15 flex-shrink-0 shadow-sm">
                <img
                  src={picturePreview}
                  alt="Preview"
                  className="h-28 w-28 rounded-lg object-cover"
                />
                <span className="absolute -top-1.5 -right-1.5 bg-success-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                  ✓ Current
                </span>
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                id="editFormProfilePicture"
                accept="image/*"
                onChange={handlePictureUpload}
                disabled={uploadingPicture}
                className="hidden"
              />
              <label
                htmlFor="editFormProfilePicture"
                className="block w-full px-6 py-5 bg-surface hover:bg-secondary/5 rounded-xl text-center cursor-pointer border-2 border-dashed border-secondary/25 hover:border-tertiary/50 transition-all duration-200"
              >
                <svg
                  className="w-8 h-8 text-tertiary mx-auto mb-2 opacity-80"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm font-bold text-primary">
                  Click to upload picture
                </p>
                <p className="text-xs text-secondary mt-1">
                  PNG, JPG, GIF up to 10MB
                </p>
              </label>
              {uploadingPicture && (
                <div className="mt-3 flex items-center gap-2 text-tertiary">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <p className="text-sm font-semibold">Uploading picture...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resume */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2.5">
            Resume/Portfolio <span className="text-red-500">*</span>
          </label>
          {formData.resume && (
            <div className="mb-6 p-4 bg-success-50 border border-success-700/20 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success-700/10 flex items-center justify-center text-success-700">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 16.5a1 1 0 01-1-1V4a1 1 0 011-1h6a1 1 0 011 1v11.5a1 1 0 01-1 1H8zm6-11.5a.5.5 0 00-.5-.5h-5a.5.5 0 00-.5.5v11a.5.5 0 00.5.5h5a.5.5 0 00.5-.5v-11z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-success-700 text-sm">
                      Resume uploaded ✓
                    </p>
                    <p className="text-xs text-secondary/70">
                      Ready to share with others
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={formData.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-success !py-1.5 !px-3 !text-xs !rounded-lg"
                  >
                    👁️ View
                  </a>
                  <button
                    type="button"
                    onClick={handleResumeDownload}
                    className="btn-secondary !py-1.5 !px-3 !text-xs !rounded-lg"
                  >
                    ⬇️ Download
                  </button>
                </div>
              </div>
            </div>
          )}
          <input
            type="file"
            id="editFormResumeFile"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleResumeUpload}
            disabled={uploadingResume}
            className="hidden"
          />
          <label
            htmlFor="editFormResumeFile"
            className="block w-full px-6 py-5 bg-surface hover:bg-secondary/5 rounded-xl text-center cursor-pointer border-2 border-dashed border-secondary/25 hover:border-tertiary/50 transition-all duration-200"
          >
            <svg
              className="w-8 h-8 text-tertiary mx-auto mb-2 opacity-80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <p className="text-sm font-bold text-primary">
              Click to upload resume
            </p>
            <p className="text-xs text-secondary mt-1">
              PDF, DOC, DOCX, TXT up to 50MB
            </p>
          </label>
          {uploadingResume && (
            <div className="mt-3 flex items-center gap-2 text-tertiary">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-sm font-semibold">Uploading resume...</p>
            </div>
          )}
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2.5">
            Availability <span className="text-red-500">*</span>
          </label>
          <select
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            className="input-base"
          >
            <option value="not available">Not Available</option>
            <option value="part-time">Part-time</option>
            <option value="full-time">Full-time</option>
          </select>
        </div>

        {/* Education */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2.5">
            Education <span className="text-red-500">*</span>
          </label>
          <div className="space-y-6">
            {formData.education.map((edu, index) => (
              <div
                key={index}
                className="p-6 bg-surface border border-secondary/15 rounded-xl relative shadow-sm mb-6"
              >
                <button
                  type="button"
                  onClick={() => removeArrayItem("education", index)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-error-700 hover:text-white bg-surface hover:bg-error-700 border border-secondary/25 transition-all duration-200 font-bold text-sm cursor-pointer"
                  title="Remove"
                >
                  ✕
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) =>
                      handleArrayChange(
                        "education",
                        index,
                        "school",
                        e.target.value,
                      )
                    }
                    placeholder="School / College"
                    className="input-base !py-2.5 !px-4 !text-sm"
                  />
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) =>
                      handleArrayChange(
                        "education",
                        index,
                        "degree",
                        e.target.value,
                      )
                    }
                    placeholder="Degree / Standard"
                    className="input-base !py-2.5 !px-4 !text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1.5">
                      From
                    </label>
                    <input
                      type="month"
                      max={new Date().toISOString().slice(0, 7)}
                      value={edu.from || ""}
                      onChange={(e) =>
                        handleArrayChange(
                          "education",
                          index,
                          "from",
                          e.target.value,
                        )
                      }
                      className="input-base !py-2.5 !px-4 !text-sm"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-secondary">To</label>
                      <label className="flex items-center gap-1.5 text-xs text-tertiary font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={edu.isCurrentlyStudying || false}
                          onChange={(e) =>
                            handleArrayChange(
                              "education",
                              index,
                              "isCurrentlyStudying",
                              e.target.checked,
                            )
                          }
                          className="w-4 h-4 rounded border-secondary/30 bg-surface text-tertiary focus:ring-tertiary/20"
                        />
                        Currently Studying
                      </label>
                    </div>
                    <input
                      type="month"
                      max={new Date().toISOString().slice(0, 7)}
                      value={edu.isCurrentlyStudying ? "" : edu.to || ""}
                      onChange={(e) =>
                        handleArrayChange(
                          "education",
                          index,
                          "to",
                          e.target.value,
                        )
                      }
                      disabled={edu.isCurrentlyStudying}
                      className="input-base !py-2.5 !px-4 !text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem("education")}
              className="btn-secondary !py-2.5 !px-5 !text-sm !rounded-lg flex items-center gap-2"
            >
              <span className="text-base font-bold">+</span> Add Education
            </button>
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2.5">
            Experience{" "}
            {Number(formData.yearsOfExperience) > 0 && (
              <span className="text-red-500">*</span>
            )}
          </label>
          <div className="space-y-6">
            {formData.experience.map((exp, index) => (
              <div
                key={index}
                className="p-6 bg-surface border border-secondary/15 rounded-xl relative shadow-sm mb-6"
              >
                <button
                  type="button"
                  onClick={() => removeArrayItem("experience", index)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-error-700 hover:text-white bg-surface hover:bg-error-700 border border-secondary/25 transition-all duration-200 font-bold text-sm cursor-pointer"
                  title="Remove"
                >
                  ✕
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) =>
                      handleArrayChange(
                        "experience",
                        index,
                        "company",
                        e.target.value,
                      )
                    }
                    placeholder="Company Name"
                    className="input-base !py-2.5 !px-4 !text-sm"
                  />
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) =>
                      handleArrayChange(
                        "experience",
                        index,
                        "role",
                        e.target.value,
                      )
                    }
                    placeholder="Role"
                    className="input-base !py-2.5 !px-4 !text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1.5">
                      From
                    </label>
                    <input
                      type="month"
                      max={new Date().toISOString().slice(0, 7)}
                      value={exp.from || ""}
                      onChange={(e) =>
                        handleArrayChange(
                          "experience",
                          index,
                          "from",
                          e.target.value,
                        )
                      }
                      className="input-base !py-2.5 !px-4 !text-sm"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-secondary">To</label>
                      <label className="flex items-center gap-1.5 text-xs text-tertiary font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exp.to === "Present"}
                          onChange={(e) =>
                            handleArrayChange(
                              "experience",
                              index,
                              "to",
                              e.target.checked ? "Present" : "",
                            )
                          }
                          className="w-4 h-4 rounded border-secondary/30 bg-surface text-tertiary focus:ring-tertiary/20"
                        />
                        Present
                      </label>
                    </div>
                    <input
                      type="month"
                      max={new Date().toISOString().slice(0, 7)}
                      value={exp.to === "Present" ? "" : exp.to || ""}
                      onChange={(e) =>
                        handleArrayChange(
                          "experience",
                          index,
                          "to",
                          e.target.value,
                        )
                      }
                      disabled={exp.to === "Present"}
                      className="input-base !py-2.5 !px-4 !text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem("experience")}
              className="btn-secondary !py-2.5 !px-5 !text-sm !rounded-lg flex items-center gap-2"
            >
              <span className="text-base font-bold">+</span> Add Experience
            </button>
          </div>
        </div>

        {/* Years of Experience */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2.5">
            Years of Experience
          </label>
          <input
            type="number"
            min="0"
            max="60"
            name="yearsOfExperience"
            value={formData.yearsOfExperience}
            onChange={handleChange}
            placeholder="e.g. 2"
            className="input-base"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2.5">
            Skills (comma separated) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="e.g. React, Node.js, MongoDB, UI/UX"
            className="input-base"
          />
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2.5">
              GitHub URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/username"
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2.5">
              LinkedIn URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              className="input-base"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2.5">
            Portfolio URL
          </label>
          <input
            type="url"
            name="portfolioUrl"
            value={formData.portfolioUrl}
            onChange={handleChange}
            placeholder="https://yourportfolio.com"
            className="input-base"
          />
        </div>

        {/* Profile Visibility */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2.5">
            Profile Visibility
          </label>
          <select
            name="profileVisibility"
            value={formData.profileVisibility}
            onChange={handleChange}
            className="input-base"
          >
            <option value="public">Public (visible to all users)</option>
            <option value="private">Private (only visible to you)</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary py-3 !rounded-lg"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary px-8 !rounded-lg"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </>
  );
}
