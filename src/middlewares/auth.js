import { verifyToken } from "../utils/token.js";
import { User } from "../models/User.js";
import { sendError } from "../utils/apiResponse.js";

/**
 * Middleware to authenticate requests via JWT cookie or Authorization Bearer header
 */
export const authenticateUser = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return sendError(res, "Authentication required. Please log in.", 401);
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return sendError(res, "Invalid or expired session. Please log in again.", 401);
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) {
      return sendError(res, "User account not found or suspended.", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, "Authentication failed.", 401, error.message);
  }
};

/**
 * Optional authentication middleware for endpoints that can be visited by guests or users
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        const user = await User.findById(decoded.id).select("-password");
        if (user && user.isActive) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
};
