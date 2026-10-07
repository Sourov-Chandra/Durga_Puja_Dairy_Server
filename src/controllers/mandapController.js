import { Mandap } from "../models/Mandap.js";
import { Schedule } from "../models/Schedule.js";
import { Event } from "../models/Event.js";
import { Announcement } from "../models/Announcement.js";
import { Image } from "../models/Image.js";
import { Favorite } from "../models/Favorite.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import {
  calculateDistanceMeters,
  calculateStringSimilarity,
  generateSlug,
} from "../utils/geoUtils.js";

/**
 * Get all published Mandaps with worldwide filtering and search
 */
export const getAllMandaps = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      country,
      city,
      state,
      search,
      status = "APPROVED",
      sort = "popular",
    } = req.query;

    const query = {};

    // Only Admin can view non-approved mandaps publicly
    if (status) {
      query.status = status;
    }

    if (country) {
      query["address.country"] = { $regex: new RegExp(`^${country}$`, "i") };
    }

    if (city) {
      query["address.cityOrDistrict"] = { $regex: new RegExp(`^${city}$`, "i") };
    }

    if (state) {
      query["address.stateOrDivision"] = { $regex: new RegExp(`^${state}$`, "i") };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { "address.areaOrLocality": { $regex: search, $options: "i" } },
        { "address.cityOrDistrict": { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {};
    if (sort === "popular") {
      sortOptions.favoriteCount = -1;
      sortOptions.viewCount = -1;
    } else if (sort === "newest") {
      sortOptions.createdAt = -1;
    } else if (sort === "name") {
      sortOptions.name = 1;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Mandap.countDocuments(query);
    const mandaps = await Mandap.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit, 10))
      .select("-__v")
      .lean();

    return sendSuccess(res, mandaps, "Mandaps fetched successfully", 200, {
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      limit: parseInt(limit, 10),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch a single Mandap by slug or ObjectId with schedules, events, and announcements
 */
export const getMandapBySlugOrId = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: identifier } : { slug: identifier };

    const mandap = await Mandap.findOne(query).populate("managerId", "name email image");
    if (!mandap) {
      return sendError(res, "Mandap not found.", 404);
    }

    // Increment view count
    mandap.viewCount += 1;
    await mandap.save();

    // Fetch related items
    const [schedules, events, announcements, galleryImages] = await Promise.all([
      Schedule.find({ mandapId: mandap._id }).sort({ date: 1, order: 1 }).lean(),
      Event.find({ mandapId: mandap._id, status: { $ne: "CANCELLED" } })
        .sort({ date: 1, startTime: 1 })
        .lean(),
      Announcement.find({ mandapId: mandap._id, status: "PUBLISHED" })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Image.find({ mandapId: mandap._id, status: "APPROVED" })
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),
    ]);

    // Check if the current user has favorited this mandap
    let isFavorited = false;
    if (req.user) {
      const fav = await Favorite.findOne({
        userId: req.user._id,
        mandapId: mandap._id,
      });
      isFavorited = !!fav;
    }

    return sendSuccess(res, {
      mandap,
      schedules,
      events,
      announcements,
      galleryImages,
      isFavorited,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Geospatial Proximity Search: Find Mandaps near coordinates [lng, lat]
 */
export const getNearbyMandaps = async (req, res, next) => {
  try {
    const { lat, lng, radiusKm = 25, limit = 20 } = req.query;

    if (!lat || !lng) {
      return sendError(res, "Please provide latitude (lat) and longitude (lng).", 400);
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDistanceMeters = parseFloat(radiusKm) * 1000;

    const mandaps = await Mandap.find({
      status: "APPROVED",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude], // [lng, lat]
          },
          $maxDistance: maxDistanceMeters,
        },
      },
    })
      .limit(parseInt(limit, 10))
      .select("name slug address location coverImage verificationStatus favoriteCount")
      .lean();

    // Attach calculated distance to each result
    const mandapsWithDistance = mandaps.map((m) => {
      const distance = calculateDistanceMeters(
        [longitude, latitude],
        m.location.coordinates
      );
      return {
        ...m,
        distanceMeters: distance,
        distanceKm: (distance / 1000).toFixed(2),
      };
    });

    return sendSuccess(
      res,
      mandapsWithDistance,
      `Found ${mandaps.length} mandaps within ${radiusKm}km`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch map points for global clustered map
 */
export const getMapClusters = async (req, res, next) => {
  try {
    const { country, city } = req.query;
    const query = { status: "APPROVED" };

    if (country) query["address.country"] = country;
    if (city) query["address.cityOrDistrict"] = city;

    const points = await Mandap.find(query)
      .select("name slug location address coverImage verificationStatus")
      .lean();

    return sendSuccess(res, points, "Map markers loaded");
  } catch (error) {
    next(error);
  }
};

/**
 * Layer 1 & 2 Duplicate Check: Test if a proposed mandap matches any existing one
 */
export const checkDuplicate = async (req, res, next) => {
  try {
    const { name, lng, lat, city } = req.query;

    if (!lng || !lat || !name) {
      return sendError(res, "Please provide name, lng, and lat.", 400);
    }

    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);

    // Layer 1: Check if any mandap is within 100 meters
    const nearbyMandaps = await Mandap.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 100, // 100 meters
        },
      },
    }).select("name slug address location");

    const matches = [];

    for (const nearby of nearbyMandaps) {
      const distance = calculateDistanceMeters(
        [longitude, latitude],
        nearby.location.coordinates
      );
      const similarity = calculateStringSimilarity(name, nearby.name);

      matches.push({
        mandapId: nearby._id,
        name: nearby.name,
        slug: nearby.slug,
        address: nearby.address,
        distanceMeters: distance,
        similarityScore: similarity,
        isLikelyDuplicate: similarity > 0.6 || distance < 40,
      });
    }

    return sendSuccess(res, {
      hasPotentialDuplicate: matches.length > 0,
      candidates: matches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new Mandap (Manager or Admin)
 */
export const createMandap = async (req, res, next) => {
  try {
    const {
      name,
      description,
      year,
      coordinates, // [lng, lat]
      address,
      contact,
      coverImage,
    } = req.body;

    if (!name || !coordinates || !address) {
      return sendError(res, "Name, coordinates [lng, lat], and address are required.", 400);
    }

    const baseSlug = generateSlug(name, address.cityOrDistrict);
    let slug = baseSlug;
    let count = 1;
    while (await Mandap.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    const isPlatformAdmin = req.user.role === "ADMIN";

    const mandap = await Mandap.create({
      name,
      slug,
      description: description || "",
      year: year || new Date().getFullYear(),
      location: {
        type: "Point",
        coordinates, // [lng, lat]
      },
      address,
      contact: contact || {},
      coverImage: coverImage || { url: "", publicId: "" },
      managerId: req.user._id,
      createdBy: req.user._id,
      status: isPlatformAdmin ? "APPROVED" : "PENDING",
      verificationStatus: isPlatformAdmin ? "VERIFIED" : "UNVERIFIED",
    });

    // Record activity log
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      mandapId: mandap._id,
      action: "MANDAP_CREATED",
      details: { name: mandap.name, slug: mandap.slug, status: mandap.status },
    });

    return sendSuccess(res, mandap, "Mandap created successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing Mandap (Manager of this Mandap or Admin)
 */
export const updateMandap = async (req, res, next) => {
  try {
    const mandap = req.mandap || (await Mandap.findById(req.params.id));
    if (!mandap) {
      return sendError(res, "Mandap not found.", 404);
    }

    const {
      name,
      description,
      coordinates,
      address,
      contact,
      coverImage,
      status,
      verificationStatus,
    } = req.body;

    if (name) mandap.name = name;
    if (description !== undefined) mandap.description = description;
    if (coordinates && Array.isArray(coordinates)) {
      mandap.location.coordinates = coordinates;
    }
    if (address) {
      mandap.address = { ...mandap.address.toObject(), ...address };
    }
    if (contact) {
      mandap.contact = { ...mandap.contact.toObject(), ...contact };
    }
    if (coverImage) mandap.coverImage = coverImage;

    // Only platform admin can change status and verification status directly
    if (req.user.role === "ADMIN") {
      if (status) mandap.status = status;
      if (verificationStatus) mandap.verificationStatus = verificationStatus;
    }

    await mandap.save();

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      mandapId: mandap._id,
      action: "MANDAP_UPDATED",
      details: { updatedFields: Object.keys(req.body) },
    });

    return sendSuccess(res, mandap, "Mandap updated successfully");
  } catch (error) {
    next(error);
  }
};
