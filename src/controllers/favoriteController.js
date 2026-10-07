import { Favorite } from "../models/Favorite.js";
import { Mandap } from "../models/Mandap.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

/**
 * Toggle favorite status for a mandap
 */
export const toggleFavorite = async (req, res, next) => {
  try {
    const { mandapId } = req.params;
    const userId = req.user._id;

    const existing = await Favorite.findOne({ userId, mandapId });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      await Mandap.findByIdAndUpdate(mandapId, {
        $inc: { favoriteCount: -1 },
      });
      return sendSuccess(res, { isFavorited: false }, "Removed from My Diary");
    } else {
      await Favorite.create({ userId, mandapId });
      await Mandap.findByIdAndUpdate(mandapId, {
        $inc: { favoriteCount: 1 },
      });
      return sendSuccess(res, { isFavorited: true }, "Saved to My Diary");
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get all favorited mandaps for the logged-in user
 */
export const getMyFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id })
      .populate({
        path: "mandapId",
        select: "name slug address location coverImage verificationStatus favoriteCount",
      })
      .sort({ createdAt: -1 })
      .lean();

    const mandaps = favorites
      .filter((f) => f.mandapId)
      .map((f) => f.mandapId);

    return sendSuccess(res, mandaps, "Saved mandaps loaded");
  } catch (error) {
    next(error);
  }
};
