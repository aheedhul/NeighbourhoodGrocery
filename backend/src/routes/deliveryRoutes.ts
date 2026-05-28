import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../middleware/auth";
import {
  claimAssignmentController,
  listAssignmentsController,
  updateDeliveryStatusController
} from "../controllers/deliveryController";

const router = Router();

router.get("/", authenticate([UserRole.DELIVERY, UserRole.ADMIN]), listAssignmentsController);
router.post(
  "/:assignmentId/claim",
  authenticate([UserRole.DELIVERY, UserRole.ADMIN]),
  claimAssignmentController
);
router.patch(
  "/:assignmentId/status",
  authenticate([UserRole.DELIVERY, UserRole.ADMIN]),
  updateDeliveryStatusController
);

export default router;
