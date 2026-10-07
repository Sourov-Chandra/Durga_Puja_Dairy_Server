import { Router } from "express";
import {
  submitMandap,
  getMySubmissions,
} from "../controllers/submissionController.js";
import { authenticateUser } from "../middlewares/auth.js";

const router = Router();

router.use(authenticateUser);

router.post("/", submitMandap);
router.get("/me", getMySubmissions);

export default router;
