import { Image } from "../models/Image.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const getMandapGallery = async (req, res, next) => {
  try {
    const { mandapId } = req.params;
    const { category } = req.query;

    const query = { mandapId, status: "APPROVED" };
    if (category) query.category = category;

    const images = await Image.find(query)
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, images, "Gallery images loaded");
  } catch (error) {
    next(error);
  }
};

export const addGalleryImage = async (req, res, next) => {
  try {
    const { mandapId } = req.params;
    const { url, publicId, caption, category } = req.body;

    if (!url || !publicId) {
      return sendError(res, "Image URL and public ID are required.", 400);
    }

    // If uploaded by manager, staff, or admin, automatically APPROVED.
    // If uploaded by a regular community USER, it requires moderation (PENDING).
    const isAuthorizedOrganizer =
      req.user.role === "ADMIN" ||
      req.user.role === "MANAGER" ||
      req.user.role === "STAFF";

    const image = await Image.create({
      mandapId,
      url,
      publicId,
      caption: caption || "",
      category: category || "GENERAL",
      uploadedBy: req.user._id,
      status: isAuthorizedOrganizer ? "APPROVED" : "PENDING",
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      mandapId,
      action: "IMAGE_UPLOADED",
      details: { url, status: image.status },
    });

    return sendSuccess(
      res,
      image,
      image.status === "APPROVED"
        ? "Photo added to gallery"
        : "Photo submitted for review",
      201
    );
  } catch (error) {
    next(error);
  }
};

export const deleteGalleryImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;
    const image = await Image.findByIdAndDelete(imageId);
    if (!image) {
      return sendError(res, "Photo not found.", 404);
    }
    return sendSuccess(res, null, "Photo deleted successfully");
  } catch (error) {
    next(error);
  }
};
