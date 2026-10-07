import { Mandap } from "../models/Mandap.js";
import { MandapStaff } from "../models/MandapStaff.js";
import { sendError } from "../utils/apiResponse.js";

/**
 * Require one of the specified global roles
 * @param  {...string} roles Allowed roles ('ADMIN', 'MANAGER', 'STAFF', 'USER')
 */
export const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Authentication required.", 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        "Access denied. You do not have permission for this action.",
        403
      );
    }

    next();
  };
};

/**
 * Resource-Level Authorization Middleware:
 * Verifies that the authenticated user has rights to modify the requested Mandap.
 * User must be:
 * 1. Global ADMIN, OR
 * 2. The Mandap Manager (mandap.managerId === user._id), OR
 * 3. An active MandapStaff assigned to this mandap with the required permission.
 *
 * @param {string} [requiredPermission] Optional permission string (e.g. 'MANAGE_SCHEDULE', 'MANAGE_EVENTS')
 */
export const requireMandapAccess = (requiredPermission = null) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return sendError(res, "Authentication required.", 401);
      }

      // Platform Admin always has full access
      if (req.user.role === "ADMIN") {
        return next();
      }

      // Resolve mandapId from params or body
      const mandapId = req.params.mandapId || req.params.id || req.body.mandapId;
      if (!mandapId) {
        return sendError(res, "Mandap ID parameter is required for authorization.", 400);
      }

      const mandap = await Mandap.findById(mandapId);
      if (!mandap) {
        return sendError(res, "Mandap not found.", 404);
      }

      // Check if user is the assigned Mandap Manager
      if (
        mandap.managerId &&
        mandap.managerId.toString() === req.user._id.toString()
      ) {
        req.mandap = mandap;
        return next();
      }

      // Check if user is an active Mandap Staff with permission
      const staffRecord = await MandapStaff.findOne({
        mandapId: mandap._id,
        userId: req.user._id,
        status: "ACTIVE",
      });

      if (staffRecord) {
        if (!requiredPermission || staffRecord.permissions.includes(requiredPermission)) {
          req.mandap = mandap;
          req.staffRecord = staffRecord;
          return next();
        } else {
          return sendError(
            res,
            `You do not have the required permission (${requiredPermission}) for this Mandap.`,
            403
          );
        }
      }

      return sendError(
        res,
        "You do not have authorization to manage this Mandap.",
        403
      );
    } catch (error) {
      return sendError(res, "Error verifying authorization.", 500, error.message);
    }
  };
};
