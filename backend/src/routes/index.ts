import { Router } from "express";

import authRoutes from "./authRoutes";
import deliveryRoutes from "./deliveryRoutes";
import orderRoutes from "./orderRoutes";
import recommendationRoutes from "./recommendationRoutes";
import storeRoutes from "./storeRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/stores", storeRoutes);
router.use("/orders", orderRoutes);
router.use("/deliveries", deliveryRoutes);
router.use("/recommendations", recommendationRoutes);

export default router;
