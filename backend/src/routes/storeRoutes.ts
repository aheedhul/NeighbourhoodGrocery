import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../middleware/auth";
import {
  createStoreController,
  nearbyStoresController,
  inventoryListController,
  inventoryUploadController,
  expiryAlertsController,
  customerStoreProductsController,
  inventoryUploadMiddleware,
  ownerStoresController
} from "../controllers/storeController";

const router = Router();

router.get("/", nearbyStoresController);
router.post("/", authenticate([UserRole.OWNER, UserRole.ADMIN]), createStoreController);
router.get("/owned", authenticate([UserRole.OWNER, UserRole.ADMIN]), ownerStoresController);
router.get("/:storeId/products", customerStoreProductsController);
router.get(
  "/:storeId/inventory",
  authenticate([UserRole.OWNER, UserRole.ADMIN]),
  inventoryListController
);
router.post(
  "/:storeId/inventory/upload",
  authenticate([UserRole.OWNER, UserRole.ADMIN]),
  inventoryUploadMiddleware,
  inventoryUploadController
);
router.get(
  "/:storeId/alerts",
  authenticate([UserRole.OWNER, UserRole.ADMIN]),
  expiryAlertsController
);

export default router;
