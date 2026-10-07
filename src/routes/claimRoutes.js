import { Router } from "express";
import { requestClaim, getMyClaims } from "../controllers/claimController.js";
import { authenticateUser } from "../middlewares/auth.js";

const router = Router();

router.use(authenticateUser);

router.post("/", requestClaim);
router.get("/me", getMyClaims);

export default router;
