import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../middleware/auth";
import { personalizedRecommendationsController } from "../controllers/recommendationController";

const router = Router();

router.get("/personalized", authenticate([UserRole.CUSTOMER]), personalizedRecommendationsController);

export default router;
