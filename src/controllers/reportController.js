import { Report } from "../models/Report.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const submitReport = async (req, res, next) => {
  try {
    const { mandapId, reason, description } = req.body;

    if (!mandapId || !reason || !description) {
      return sendError(res, "Mandap ID, reason, and description are required.", 400);
    }

    const report = await Report.create({
      mandapId,
      reportedBy: req.user._id,
      reason,
      description,
      status: "OPEN",
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      mandapId,
      action: "REPORT_SUBMITTED",
      details: { reason },
    });

    return sendSuccess(
      res,
      report,
      "Thank you for your report. Our moderators will investigate.",
      201
    );
  } catch (error) {
    next(error);
  }
};
