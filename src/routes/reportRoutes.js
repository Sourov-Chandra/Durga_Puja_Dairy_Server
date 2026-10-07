import { Router } from "express";
import { submitReport } from "../controllers/reportController.js";
import { authenticateUser } from "../middlewares/auth.js";

const router = Router();

router.use(authenticateUser);

router.post("/", submitReport);

export default router;
