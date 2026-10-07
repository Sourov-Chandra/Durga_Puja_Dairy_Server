import { Router } from "express";
import {
  toggleFavorite,
  getMyFavorites,
} from "../controllers/favoriteController.js";
import { authenticateUser } from "../middlewares/auth.js";

const router = Router();

router.use(authenticateUser);

router.get("/", getMyFavorites);
router.post("/:mandapId", toggleFavorite);

export default router;
