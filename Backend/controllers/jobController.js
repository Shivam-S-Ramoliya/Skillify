const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");
const User = require("../models/User");
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");

const requirePublicProfileForJobs = async (userId, res) => {
  const user = await User.findById(userId).select("_id profileVisibility");

  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
    return null;
  }

  if (user.profileVisibility !== "public") {
    res.status(403).json({
      success: false,
      message:
        "Only users with a public profile can discover, apply, or publish jobs",
    });
    return null;
  }

  return user;
};

// @desc    Publish a new job
// @route   POST /api/jobs/publish
// @access  Private
exports.publishJob = async (req, res) => {
  try {
    const user = await requirePublicProfileForJobs(req.user.id, res);
    if (!user) {
      return;
    }

    const {
      jobName,
      githubRepoUrl,
      jobDetails,
      experienceRequired,
      compensationType,
      salary,
      durationFrom,
      durationTo,
      closingDate,
    } = req.body;

    let skillsRequired = req.body.skillsRequired;

    if (!jobName || !jobDetails || !experienceRequired || !compensationType || !closingDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide job name, job details, experience required, paid/unpaid option, and closing date",
      });
    }

    if (!["paid", "unpaid"].includes(String(compensationType).toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Compensation type must be paid or unpaid",
      });
    }

    if (!durationFrom || !durationTo) {
      return res.status(400).json({
        success: false,
        message: "Please provide both duration start and end dates",
      });
    }

    const parsedFrom = new Date(durationFrom);
    const parsedTo = new Date(durationTo);
    const parsedClosing = new Date(closingDate);

    if (
      Number.isNaN(parsedFrom.getTime()) ||
      Number.isNaN(parsedTo.getTime()) ||
      Number.isNaN(parsedClosing.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid dates provided",
      });
    }

    if (parsedFrom >= parsedTo) {
      return res.status(400).json({
        success: false,
        message: "Job duration start date must be before the end date",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const closingDay = new Date(parsedClosing);
    closingDay.setHours(0, 0, 0, 0);

    if (closingDay < today) {
      return res.status(400).json({
        success: false,
        message: "Application closing date cannot be in the past",
      });
    }

    if (parsedClosing >= parsedFrom) {
      return res.status(400).json({
        success: false,
        message: "Application closing date must be before the job start date",
      });
    }

    if (typeof skillsRequired === "string") {
      try {
        const parsed = JSON.parse(skillsRequired);
        skillsRequired = Array.isArray(parsed) ? parsed : [skillsRequired];
      } catch (error) {
        skillsRequired = skillsRequired.split(",");
      }
    }

    if (!Array.isArray(skillsRequired)) {
      skillsRequired = [];
    }

    skillsRequired = skillsRequired
      .map((skill) => String(skill).trim())
      .filter(Boolean);

    if (skillsRequired.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one required skill",
      });
    }

    const normalizedCompensationType = String(compensationType).toLowerCase();

    if (normalizedCompensationType === "paid" && !salary) {
      return res.status(400).json({
        success: false,
        message: "Salary is required when job type is paid",
      });
    }

    let jobDescriptionDocument = null;
    let jobDescriptionDocumentPublicId = null;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "job-description-documents",
        req.file.originalname,
      );
      jobDescriptionDocument = uploadResult.url;
      jobDescriptionDocumentPublicId = uploadResult.publicId;
    }

    const job = await Job.create({
      jobName: jobName.trim(),
      githubRepoUrl: githubRepoUrl ? githubRepoUrl.trim() : "",
      jobDetails: jobDetails.trim(),
      skillsRequired,
      experienceRequired: experienceRequired.trim(),
      compensationType: normalizedCompensationType,
      salary:
        normalizedCompensationType === "paid" ? String(salary).trim() : "",
      durationFrom: parsedFrom,
      durationTo: parsedTo,
      closingDate: parsedClosing,
      status: "open",
      startDate: new Date(),
      jobDescriptionDocument,
      jobDescriptionDocumentPublicId,
      postedBy: user._id,
    });

    res.status(201).json({
      success: true,
      message: "Job published successfully",
      data: job,
    });
  } catch (error) {
    console.error("publishJob error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while publishing job",
    });
  }
};

// @desc    Discover jobs (excluding current user's jobs)
// @route   GET /api/jobs/discover
// @access  Private
exports.discoverJobs = async (req, res) => {
  try {
    const user = await requirePublicProfileForJobs(req.user.id, res);
    if (!user) {
      return;
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      50,
    );
    const skip = (page - 1) * limit;
    const skill = (req.query.skill || "").trim();

    const query = {
      postedBy: { $ne: req.user.id },
      status: "open",
      closingDate: { $gt: new Date() }
    };

    if (skill) {
      query.skillsRequired = { $regex: skill, $options: "i" };
    }

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate(
          "postedBy",
          "name username profilePicture location company currentRole",
        )
        .lean(),
      Job.countDocuments(query),
    ]);

    const jobIds = jobs.map((job) => job._id);
    const existingApplications = await JobApplication.find({
      job: { $in: jobIds },
      applicant: req.user.id,
    })
      .select("job status")
      .lean();

    const applicationsByJob = new Map(
      existingApplications.map((application) => [
        String(application.job),
        application,
      ]),
    );

    const data = jobs.map((job) => {
      const existingApplication = applicationsByJob.get(String(job._id));
      return {
        ...job,
        hasApplied: Boolean(existingApplication),
        applicationStatus: existingApplication
          ? existingApplication.status
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      data,
      page,
      pages: Math.ceil(total / limit) || 1,
      total,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while discovering jobs",
    });
  }
};

// @desc    Apply to a job
// @route   POST /api/jobs/:jobId/apply
// @access  Private
exports.applyToJob = async (req, res) => {
  try {
    const user = await requirePublicProfileForJobs(req.user.id, res);
    if (!user) {
      return;
    }

    const { jobId } = req.params;

    const job = await Job.findById(jobId).select("_id postedBy status closingDate");
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.status !== "open" || new Date() > new Date(job.closingDate)) {
      return res.status(400).json({
        success: false,
        message: "This job is no longer accepting applications",
      });
    }

    if (String(job.postedBy) === String(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot apply to your own job",
      });
    }

    const existing = await JobApplication.findOne({
      job: job._id,
      applicant: req.user.id,
    });

    if (existing) {
      if (existing.status === "withdrawn") {
        existing.status = "pending";
        await existing.save();
        return res.status(200).json({
          success: true,
          message: "Application submitted successfully",
          data: existing,
        });
      }

      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const application = await JobApplication.create({
      job: job._id,
      applicant: req.user.id,
      employer: job.postedBy,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while applying to job",
    });
  }
};

// @desc    Get applications sent by current user
// @route   GET /api/jobs/applications/sent
// @access  Private
exports.getSentApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ applicant: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: "job",
        select:
          "jobName skillsRequired experienceRequired compensationType salary durationFrom durationTo postedBy",
        populate: {
          path: "postedBy",
          select: "name username profilePicture location company currentRole",
        },
      })
      .populate("employer", "name username profilePicture location company currentRole")
      .lean();

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while loading sent applications",
    });
  }
};

// @desc    Get applications received by current user
// @route   GET /api/jobs/applications/received
// @access  Private
exports.getReceivedApplications = async (req, res) => {
  try {
    const query = { employer: req.user.id };

    // Optional: filter by specific job
    const { jobId } = req.query;
    if (jobId) {
      query.job = jobId;
    }

    const applications = await JobApplication.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: "job",
        select:
          "jobName skillsRequired experienceRequired compensationType salary durationFrom durationTo postedBy",
      })
      .populate(
        "applicant",
        "name username profilePicture location skills experience yearsOfExperience githubUrl linkedinUrl currentRole company",
      )
      .lean();

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error.message || "Server error while loading received applications",
    });
  }
};

// @desc    Update application status
// @route   PUT /api/jobs/applications/:applicationId/status
// @access  Private
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const normalizedStatus = String(status).toLowerCase();
    const allowedStatuses = ["accepted", "rejected", "withdrawn"];

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const application = await JobApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (normalizedStatus === "withdrawn") {
      if (String(application.applicant) !== String(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "Only applicant can withdraw application",
        });
      }
    } else if (String(application.employer) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Only job owner can update this application status",
      });
    }

    application.status = normalizedStatus;
    await application.save();

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: application,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error.message || "Server error while updating application status",
    });
  }
};

// @desc    Get jobs posted by current user (with applicant counts)
// @route   GET /api/jobs/my-posts
// @access  Private
exports.getMyPostedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate(
        "postedBy",
        "name username profilePicture location company currentRole",
      )
      .lean();

    // Get applicant counts for all jobs in one query
    const jobIds = jobs.map((job) => job._id);
    const counts = await JobApplication.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: "$job", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      counts.map((c) => [String(c._id), c.count]),
    );

    const data = jobs.map((job) => ({
      ...job,
      applicantCount: countMap.get(String(job._id)) || 0,
    }));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error.message || "Server error while loading your posted jobs",
    });
  }
};
// @desc    Toggle job status (open/closed)
// @route   PUT /api/jobs/:jobId/status
// @access  Private
exports.toggleJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (String(job.postedBy) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Only the job poster can toggle its status",
      });
    }

    // Toggle logic
    if (job.status === "open") {
      // Closing the job — no extra input needed
      job.status = "closed";
    } else {
      // Re-opening — require a new closing date
      const { closingDate } = req.body;
      if (!closingDate) {
        return res.status(400).json({
          success: false,
          message: "A new application closing date is required to re-open the job",
        });
      }

      const parsedClosing = new Date(closingDate);
      if (Number.isNaN(parsedClosing.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid closing date",
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const closingDay = new Date(parsedClosing);
      closingDay.setHours(0, 0, 0, 0);

      if (closingDay < today) {
        return res.status(400).json({
          success: false,
          message: "Application closing date cannot be in the past",
        });
      }

      if (parsedClosing >= new Date(job.durationFrom)) {
        return res.status(400).json({
          success: false,
          message: "Application closing date must be before the job start date",
        });
      }

      job.status = "open";
      job.closingDate = parsedClosing;
    }

    await job.save();

    return res.status(200).json({
      success: true,
      message: `Job is now ${job.status}`,
      data: job,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while toggling job status",
    });
  }
};
