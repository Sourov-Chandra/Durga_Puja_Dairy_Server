import { Announcement } from "../models/Announcement.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const getMandapAnnouncements = async (req, res, next) => {
  try {
    const { mandapId } = req.params;
    const announcements = await Announcement.find({
      mandapId,
      status: "PUBLISHED",
    })
      .sort({ createdAt: -1 })
      .lean();
    return sendSuccess(res, announcements, "Announcements loaded");
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const { mandapId } = req.params;
    const { title, content, priority } = req.body;

    if (!title || !content) {
      return sendError(res, "Title and content are required.", 400);
    }

    const announcement = await Announcement.create({
      mandapId,
      title,
      content,
      priority: priority || "NORMAL",
      status: "PUBLISHED",
      createdBy: req.user._id,
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      mandapId,
      action: "ANNOUNCEMENT_CREATED",
      details: { title: announcement.title, priority: announcement.priority },
    });

    return sendSuccess(res, announcement, "Announcement published", 201);
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const { announcementId } = req.params;
    const announcement = await Announcement.findByIdAndDelete(announcementId);
    if (!announcement) {
      return sendError(res, "Announcement not found.", 404);
    }
    return sendSuccess(res, null, "Announcement deleted successfully");
  } catch (error) {
    next(error);
  }
};
