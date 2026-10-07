import { User } from "../models/User.js";
import { Mandap } from "../models/Mandap.js";
import { MandapStaff } from "../models/MandapStaff.js";
import { generateToken, sendTokenCookie, clearTokenCookie } from "../utils/token.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { ActivityLog } from "../models/ActivityLog.js";

/**
 * Register a new account (Default role: USER)
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, country, phone } = req.body;

    if (!name || !email || !password) {
      return sendError(res, "Name, email, and password are required.", 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, "An account with this email already exists.", 409);
    }

    // Role is strictly defaulted to USER for security
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      country: country || "",
      phone: phone || "",
      role: "USER",
    });

    const token = generateToken({ id: user._id, role: user.role });
    sendTokenCookie(res, token);

    // Record audit log
    await ActivityLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: "USER_REGISTERED",
      details: { email: user.email },
    });

    return sendSuccess(
      res,
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          country: user.country,
        },
        token,
      },
      "Account registered successfully",
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Log into existing account
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Please provide email and password.", 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return sendError(res, "Invalid email or password.", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, "Invalid email or password.", 401);
    }

    if (!user.isActive) {
      return sendError(res, "Your account is suspended. Please contact support.", 403);
    }

    const token = generateToken({ id: user._id, role: user.role });
    sendTokenCookie(res, token);

    return sendSuccess(
      res,
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          country: user.country,
        },
        token,
      },
      "Logged in successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Log out user by clearing cookie
 */
export const logout = async (req, res) => {
  clearTokenCookie(res);
  return sendSuccess(res, null, "Logged out successfully");
};

/**
 * Fetch current authenticated user's full context (profile, managed mandaps, staff roles)
 */
export const getMe = async (req, res, next) => {
  try {
    const user = req.user;

    // Fetch mandaps where user is Manager
    const managedMandaps = await Mandap.find({ managerId: user._id })
      .select("_id name slug coverImage address status")
      .lean();

    // Fetch mandaps where user is Staff
    const staffAssignments = await MandapStaff.find({
      userId: user._id,
      status: "ACTIVE",
    })
      .populate("mandapId", "_id name slug coverImage address status")
      .lean();

    return sendSuccess(res, {
      user,
      managedMandaps,
      staffAssignments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated user's profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, country, image } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, "User not found.", 404);
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (country !== undefined) user.country = country;
    if (image !== undefined) user.image = image;

    await user.save();

    return sendSuccess(res, { user }, "Profile updated successfully");
  } catch (error) {
    next(error);
  }
};
