import { Submission } from "../models/Submission.js";
import { Mandap } from "../models/Mandap.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import {
  calculateDistanceMeters,
  calculateStringSimilarity,
} from "../utils/geoUtils.js";

/**
 * Public registered user submits a proposed Mandap
 */
export const submitMandap = async (req, res, next) => {
  try {
    const {
      name,
      description,
      coordinates, // [lng, lat]
      address,
      contactPhone,
      coverImageUrl,
    } = req.body;

    if (!name || !coordinates || !address) {
      return sendError(
        res,
        "Name, coordinates [lng, lat], and address are required.",
        400
      );
    }

    const [longitude, latitude] = coordinates;

    // Run automated duplicate risk detection against existing mandaps
    const nearbyMandaps = await Mandap.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 150, // 150 meters
        },
      },
    }).select("name location address");

    let isPotentialDuplicate = false;
    let matchedMandapId = null;
    let matchedDistanceMeters = null;
    let nameSimilarityScore = 0;

    for (const nearby of nearbyMandaps) {
      const distance = calculateDistanceMeters(
        [longitude, latitude],
        nearby.location.coordinates
      );
      const similarity = calculateStringSimilarity(name, nearby.name);

      if (similarity > 0.55 || distance < 50) {
        isPotentialDuplicate = true;
        matchedMandapId = nearby._id;
        matchedDistanceMeters = distance;
        nameSimilarityScore = similarity;
        break;
      }
    }

    const submission = await Submission.create({
      name,
      description: description || "",
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      address,
      contactPhone: contactPhone || "",
      coverImageUrl: coverImageUrl || "",
      submittedBy: req.user._id,
      duplicateCheck: {
        isPotentialDuplicate,
        matchedMandapId,
        matchedDistanceMeters,
        nameSimilarityScore,
      },
      status: "PENDING",
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: "MANDAP_SUBMITTED",
      details: {
        submissionId: submission._id,
        name: submission.name,
        isPotentialDuplicate,
      },
    });

    return sendSuccess(
      res,
      submission,
      "Mandap submission received! It will be reviewed by administrators.",
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get submissions made by the logged-in user
 */
export const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ submittedBy: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    return sendSuccess(res, submissions, "Your submissions loaded");
  } catch (error) {
    next(error);
  }
};
