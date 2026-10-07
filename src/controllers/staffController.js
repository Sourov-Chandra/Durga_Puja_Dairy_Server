import { MandapStaff } from "../models/MandapStaff.js";
import { User } from "../models/User.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const getMandapStaff = async (req, res, next) => {
  try {
    const { mandapId } = req.params;
    const staff = await MandapStaff.find({ mandapId })
      .populate("userId", "name email image role phone")
      .populate("assignedBy", "name")
      .lean();
    return sendSuccess(res, staff, "Staff members loaded");
  } catch (error) {
    next(error);
  }
};

export const assignStaff = async (req, res, next) => {
  try {
    const { mandapId } = req.params;
    const { email, role, permissions } = req.body;

    if (!email) {
      return sendError(res, "Staff user email is required.", 400);
    }

    const targetUser = await User.findOne({ email: email.toLowerCase() });
    if (!targetUser) {
      return sendError(
        res,
        "No registered user found with this email. Please ask them to register first.",
        404
      );
    }

    // Check if already assigned
    const existing = await MandapStaff.findOne({
      mandapId,
      userId: targetUser._id,
    });

    if (existing) {
      existing.role = role || existing.role;
      if (permissions) existing.permissions = permissions;
      existing.status = "ACTIVE";
      await existing.save();
      return sendSuccess(res, existing, "Staff permissions updated");
    }

    const newStaff = await MandapStaff.create({
      mandapId,
      userId: targetUser._id,
      role: role || "STAFF",
      permissions: permissions || [
        "MANAGE_SCHEDULE",
        "MANAGE_EVENTS",
        "MANAGE_GALLERY",
        "POST_ANNOUNCEMENTS",
      ],
      assignedBy: req.user._id,
      status: "ACTIVE",
    });

    // If user was USER, promote to STAFF role globally if not already Manager/Admin
    if (targetUser.role === "USER") {
      targetUser.role = "STAFF";
      await targetUser.save();
    }

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      mandapId,
      action: "STAFF_ASSIGNED",
      details: { staffUserId: targetUser._id, staffEmail: targetUser.email },
    });

    return sendSuccess(res, newStaff, "Staff assigned successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const removeStaff = async (req, res, next) => {
  try {
    const { mandapId, userId } = req.params;

    const staffRecord = await MandapStaff.findOneAndDelete({
      mandapId,
      userId,
    });

    if (!staffRecord) {
      return sendError(res, "Staff record not found.", 404);
    }

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      mandapId,
      action: "STAFF_REMOVED",
      details: { removedUserId: userId },
    });

    return sendSuccess(res, null, "Staff access revoked successfully");
  } catch (error) {
    next(error);
  }
};
