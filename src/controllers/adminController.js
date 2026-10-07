import { User } from "../models/User.js";
import { Mandap } from "../models/Mandap.js";
import { Submission } from "../models/Submission.js";
import { ClaimRequest } from "../models/ClaimRequest.js";
import { Report } from "../models/Report.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { generateSlug } from "../utils/geoUtils.js";

/**
 * Superadmin dashboard global metrics
 */
export const getDashboardMetrics = async (req, res, next) => {
  try {
    const [
      totalMandaps,
      approvedMandaps,
      pendingSubmissions,
      pendingClaims,
      openReports,
      totalUsers,
      countriesCount,
    ] = await Promise.all([
      Mandap.countDocuments(),
      Mandap.countDocuments({ status: "APPROVED" }),
      Submission.countDocuments({ status: "PENDING" }),
      ClaimRequest.countDocuments({ status: "PENDING" }),
      Report.countDocuments({ status: "OPEN" }),
      User.countDocuments(),
      Mandap.distinct("address.country"),
    ]);

    return sendSuccess(res, {
      totalMandaps,
      approvedMandaps,
      pendingSubmissions,
      pendingClaims,
      openReports,
      totalUsers,
      totalCountries: countriesCount.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get submissions queue for admin review
 */
export const getSubmissions = async (req, res, next) => {
  try {
    const { status = "PENDING" } = req.query;
    const query = status ? { status } : {};

    const submissions = await Submission.find(query)
      .populate("submittedBy", "name email")
      .populate("duplicateCheck.matchedMandapId", "name slug address")
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, submissions, "Submissions loaded");
  } catch (error) {
    next(error);
  }
};

/**
 * Review a mandap submission: APPROVE or REJECT
 */
export const reviewSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, reviewNotes } = req.body; // action: "APPROVE" | "REJECT"

    const submission = await Submission.findById(id);
    if (!submission) {
      return sendError(res, "Submission not found.", 404);
    }

    if (submission.status !== "PENDING") {
      return sendError(res, `Submission has already been ${submission.status}.`, 400);
    }

    if (action === "APPROVE") {
      submission.status = "APPROVED";
      submission.reviewNotes = reviewNotes || "Approved by administrator";
      submission.reviewedBy = req.user._id;
      await submission.save();

      // Create new live Mandap from submission
      const baseSlug = generateSlug(
        submission.name,
        submission.address.cityOrDistrict
      );
      let slug = baseSlug;
      let count = 1;
      while (await Mandap.findOne({ slug })) {
        slug = `${baseSlug}-${count++}`;
      }

      const mandap = await Mandap.create({
        name: submission.name,
        slug,
        description: submission.description,
        location: submission.location,
        address: submission.address,
        coverImage: {
          url: submission.coverImageUrl || "",
          publicId: "",
        },
        contact: {
          phone: submission.contactPhone || "",
        },
        managerId: submission.submittedBy,
        createdBy: submission.submittedBy,
        status: "APPROVED",
        verificationStatus: "VERIFIED",
      });

      // Update submitter role to MANAGER if currently USER
      await User.findByIdAndUpdate(submission.submittedBy, {
        role: "MANAGER",
      });

      await ActivityLog.create({
        userId: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        mandapId: mandap._id,
        action: "SUBMISSION_APPROVED",
        details: { submissionId: submission._id, mandapId: mandap._id },
      });

      return sendSuccess(res, { submission, mandap }, "Submission approved and Mandap created");
    } else if (action === "REJECT") {
      submission.status = "REJECTED";
      submission.reviewNotes = reviewNotes || "Rejected by administrator";
      submission.reviewedBy = req.user._id;
      await submission.save();

      await ActivityLog.create({
        userId: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        action: "SUBMISSION_REJECTED",
        details: { submissionId: submission._id, reviewNotes },
      });

      return sendSuccess(res, submission, "Submission rejected");
    } else {
      return sendError(res, "Invalid action. Use APPROVE or REJECT.", 400);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get claim requests for admin review
 */
export const getClaims = async (req, res, next) => {
  try {
    const { status = "PENDING" } = req.query;
    const query = status ? { status } : {};

    const claims = await ClaimRequest.find(query)
      .populate("mandapId", "name slug address coverImage managerId")
      .populate("requestedBy", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, claims, "Claims loaded");
  } catch (error) {
    next(error);
  }
};

/**
 * Review a claim request: APPROVE or REJECT
 */
export const reviewClaim = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, reviewNotes } = req.body;

    const claim = await ClaimRequest.findById(id);
    if (!claim) {
      return sendError(res, "Claim request not found.", 404);
    }

    if (claim.status !== "PENDING") {
      return sendError(res, `Claim has already been ${claim.status}.`, 400);
    }

    if (action === "APPROVE") {
      claim.status = "APPROVED";
      claim.reviewNotes = reviewNotes || "Claim verified by admin";
      claim.reviewedBy = req.user._id;
      await claim.save();

      // Assign claimant as the manager of the mandap
      const mandap = await Mandap.findByIdAndUpdate(
        claim.mandapId,
        {
          managerId: claim.requestedBy,
          verificationStatus: "OFFICIAL",
        },
        { new: true }
      );

      // Promote claimant to MANAGER role
      await User.findByIdAndUpdate(claim.requestedBy, {
        role: "MANAGER",
      });

      await ActivityLog.create({
        userId: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        mandapId: claim.mandapId,
        action: "CLAIM_APPROVED",
        details: { claimId: claim._id, newManagerId: claim.requestedBy },
      });

      return sendSuccess(res, { claim, mandap }, "Claim request approved");
    } else if (action === "REJECT") {
      claim.status = "REJECTED";
      claim.reviewNotes = reviewNotes || "Claim rejected";
      claim.reviewedBy = req.user._id;
      await claim.save();

      await ActivityLog.create({
        userId: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        mandapId: claim.mandapId,
        action: "CLAIM_REJECTED",
        details: { claimId: claim._id, reviewNotes },
      });

      return sendSuccess(res, claim, "Claim request rejected");
    } else {
      return sendError(res, "Invalid action. Use APPROVE or REJECT.", 400);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get problem reports
 */
export const getReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const reports = await Report.find(query)
      .populate("mandapId", "name slug address")
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, reports, "Reports loaded");
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve report
 */
export const resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    const report = await Report.findByIdAndUpdate(
      id,
      {
        status: status || "RESOLVED",
        resolutionNotes: resolutionNotes || "",
        reviewedBy: req.user._id,
      },
      { new: true }
    );

    return sendSuccess(res, report, "Report status updated");
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users list
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit, 10))
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, users, "Users loaded", 200, {
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["USER", "STAFF", "MANAGER", "ADMIN"].includes(role)) {
      return sendError(res, "Invalid role.", 400);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    return sendSuccess(res, user, `User role updated to ${role}`);
  } catch (error) {
    next(error);
  }
};

/**
 * Get activity logs
 */
export const getActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const total = await ActivityLog.countDocuments();
    const logs = await ActivityLog.find()
      .populate("mandapId", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    return sendSuccess(res, logs, "Activity logs loaded", 200, {
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
    });
  } catch (error) {
    next(error);
  }
};
