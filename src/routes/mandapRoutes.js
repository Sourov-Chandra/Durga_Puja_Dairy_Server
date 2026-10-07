import { Router } from "express";
import {
  getAllMandaps,
  getMandapBySlugOrId,
  getNearbyMandaps,
  getMapClusters,
  checkDuplicate,
  createMandap,
  updateMandap,
} from "../controllers/mandapController.js";
import {
  getMandapSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../controllers/scheduleController.js";
import {
  getMandapEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import {
  getMandapAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import {
  getMandapGallery,
  addGalleryImage,
  deleteGalleryImage,
} from "../controllers/galleryController.js";
import {
  getMandapStaff,
  assignStaff,
  removeStaff,
} from "../controllers/staffController.js";
import { authenticateUser, optionalAuth } from "../middlewares/auth.js";
import { requireRoles, requireMandapAccess } from "../middlewares/rbac.js";

const router = Router();

// ========================
// PUBLIC ROUTES
// ========================
router.get("/", getAllMandaps);
router.get("/nearby", getNearbyMandaps);
router.get("/map-clusters", getMapClusters);
router.get("/check-duplicate", checkDuplicate);
router.get("/:identifier", optionalAuth, getMandapBySlugOrId);

// Public Sub-Resources
router.get("/:mandapId/schedules", getMandapSchedules);
router.get("/:mandapId/events", getMandapEvents);
router.get("/:mandapId/announcements", getMandapAnnouncements);
router.get("/:mandapId/gallery", getMandapGallery);

// ========================
// PROTECTED MANAGEMENT ROUTES
// ========================

// Create Mandap (Manager or Admin)
router.post(
  "/",
  authenticateUser,
  requireRoles("ADMIN", "MANAGER", "USER"),
  createMandap
);

// Update Mandap Profile (Mandap Manager or Admin)
router.patch(
  "/:id",
  authenticateUser,
  requireMandapAccess(),
  updateMandap
);

// --- Schedules (Requires MANAGE_SCHEDULE) ---
router.post(
  "/:mandapId/schedules",
  authenticateUser,
  requireMandapAccess("MANAGE_SCHEDULE"),
  createSchedule
);
router.patch(
  "/:mandapId/schedules/:scheduleId",
  authenticateUser,
  requireMandapAccess("MANAGE_SCHEDULE"),
  updateSchedule
);
router.delete(
  "/:mandapId/schedules/:scheduleId",
  authenticateUser,
  requireMandapAccess("MANAGE_SCHEDULE"),
  deleteSchedule
);

// --- Events (Requires MANAGE_EVENTS) ---
router.post(
  "/:mandapId/events",
  authenticateUser,
  requireMandapAccess("MANAGE_EVENTS"),
  createEvent
);
router.patch(
  "/:mandapId/events/:eventId",
  authenticateUser,
  requireMandapAccess("MANAGE_EVENTS"),
  updateEvent
);
router.delete(
  "/:mandapId/events/:eventId",
  authenticateUser,
  requireMandapAccess("MANAGE_EVENTS"),
  deleteEvent
);

// --- Announcements (Requires POST_ANNOUNCEMENTS) ---
router.post(
  "/:mandapId/announcements",
  authenticateUser,
  requireMandapAccess("POST_ANNOUNCEMENTS"),
  createAnnouncement
);
router.delete(
  "/:mandapId/announcements/:announcementId",
  authenticateUser,
  requireMandapAccess("POST_ANNOUNCEMENTS"),
  deleteAnnouncement
);

// --- Gallery (Requires MANAGE_GALLERY for staff/manager, or general USER upload) ---
router.post(
  "/:mandapId/gallery",
  authenticateUser,
  addGalleryImage
);
router.delete(
  "/:mandapId/gallery/:imageId",
  authenticateUser,
  requireMandapAccess("MANAGE_GALLERY"),
  deleteGalleryImage
);

// --- Staff Management (Manager or Admin only) ---
router.get(
  "/:mandapId/staff",
  authenticateUser,
  requireMandapAccess(),
  getMandapStaff
);
router.post(
  "/:mandapId/staff",
  authenticateUser,
  requireMandapAccess(),
  assignStaff
);
router.delete(
  "/:mandapId/staff/:userId",
  authenticateUser,
  requireMandapAccess(),
  removeStaff
);

export default router;
