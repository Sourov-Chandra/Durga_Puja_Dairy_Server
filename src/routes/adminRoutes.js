import { Router } from "express";
import {
  getDashboardMetrics,
  getSubmissions,
  reviewSubmission,
  getClaims,
  reviewClaim,
  getReports,
  resolveReport,
  getAllUsers,
  updateUserRole,
  getActivityLogs,
} from "../controllers/adminController.js";
import { authenticateUser } from "../middlewares/auth.js";
import { requireRoles } from "../middlewares/rbac.js";

const router = Router();

// All Admin routes require authentication and global ADMIN role
router.use(authenticateUser, requireRoles("ADMIN"));

router.get("/metrics", getDashboardMetrics);

// Submissions Review Queue
router.get("/submissions", getSubmissions);
router.post("/submissions/:id/review", reviewSubmission);

// Claims Review Queue
router.get("/claims", getClaims);
router.post("/claims/:id/review", reviewClaim);

// Reports Queue
router.get("/reports", getReports);
router.patch("/reports/:id", resolveReport);

// User Governance
router.get("/users", getAllUsers);
router.patch("/users/:userId/role", updateUserRole);

// Audit Trail
router.get("/activity-logs", getActivityLogs);

export default router;
