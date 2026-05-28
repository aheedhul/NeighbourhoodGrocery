import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../middleware/auth";
import {
  createOrderController,
  getOrderController,
  listMyOrdersController,
  listStoreOrdersController,
  updateOrderStatusController
} from "../controllers/orderController";

const router = Router();

router.post("/", authenticate([UserRole.CUSTOMER]), createOrderController);
router.get("/mine", authenticate([UserRole.CUSTOMER]), listMyOrdersController);
router.get(
  "/store/:storeId",
  authenticate([UserRole.OWNER, UserRole.ADMIN]),
  listStoreOrdersController
);
router.get("/:orderId", authenticate([UserRole.CUSTOMER, UserRole.OWNER, UserRole.ADMIN]), getOrderController);
router.patch(
  "/:orderId/status",
  authenticate([UserRole.OWNER, UserRole.ADMIN]),
  updateOrderStatusController
);

export default router;
