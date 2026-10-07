import { ClaimRequest } from "../models/ClaimRequest.js";
import { Mandap } from "../models/Mandap.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

/**
 * Submit request to claim an existing Mandap
 */
export const requestClaim = async (req, res, next) => {
  try {
    const {
      mandapId,
      committeeRole,
      contactPhone,
      contactEmail,
      verificationDocUrl,
      proofNotes,
    } = req.body;

    if (!mandapId || !committeeRole || !contactPhone || !contactEmail || !proofNotes) {
      return sendError(
        res,
        "Mandap ID, role, contact phone, contact email, and proof notes are required.",
        400
      );
    }

    const mandap = await Mandap.findById(mandapId);
    if (!mandap) {
      return sendError(res, "Mandap not found.", 404);
    }

    // Check if user already has a pending claim for this mandap
    const existing = await ClaimRequest.findOne({
      mandapId,
      requestedBy: req.user._id,
      status: "PENDING",
    });

    if (existing) {
      return sendError(
        res,
        "You already have a pending claim request for this Mandap.",
        409
      );
    }

    const claim = await ClaimRequest.create({
      mandapId,
      requestedBy: req.user._id,
      committeeRole,
      contactPhone,
      contactEmail,
      verificationDocUrl: verificationDocUrl || "",
      proofNotes,
      status: "PENDING",
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      mandapId,
      action: "CLAIM_REQUESTED",
      details: { claimId: claim._id, committeeRole },
    });

    return sendSuccess(
      res,
      claim,
      "Claim request submitted successfully. Admins will review your verification details.",
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get claim requests submitted by the logged-in user
 */
export const getMyClaims = async (req, res, next) => {
  try {
    const claims = await ClaimRequest.find({ requestedBy: req.user._id })
      .populate("mandapId", "name slug address coverImage")
      .sort({ createdAt: -1 })
      .lean();
    return sendSuccess(res, claims, "Your claim requests loaded");
  } catch (error) {
    next(error);
  }
};
