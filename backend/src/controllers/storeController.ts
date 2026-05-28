import type { Request, Response } from "express";
import multer from "multer";

import {
  processInventoryUpload,
  getStoreInventory,
  getExpiryAlerts,
  listStoreProductsForCustomers
} from "../services/inventoryService";
import { createStore, listStoresNearby, listStoresForOwner } from "../services/storeService";
import { createStoreSchema, nearbyStoreSchema } from "../validators/storeValidator";

const upload = multer({ storage: multer.memoryStorage() });

export const inventoryUploadMiddleware = upload.single("file");

export async function createStoreController(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const payload = createStoreSchema.parse(req.body);
  const store = await createStore(req.user.id, payload);
  res.status(201).json({ ...store, minOrderValue: Number(store.minOrderValue) });
}

export async function nearbyStoresController(req: Request, res: Response) {
  const query = nearbyStoreSchema.parse(req.query);
  const stores = await listStoresNearby(query.latitude, query.longitude, query.radiusKm);
  res.json(stores);
}

export async function inventoryListController(req: Request, res: Response) {
  const storeId = req.params.storeId;
  const items = await getStoreInventory(storeId);
  res.json(items);
}

export async function inventoryUploadController(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const storeId = req.params.storeId;

  if (!req.file) {
    return res.status(400).json({ message: "Inventory file required" });
  }

  const summary = await processInventoryUpload(storeId, req.file.buffer, req.file.originalname);
  res.json(summary);
}

export async function expiryAlertsController(req: Request, res: Response) {
  const storeId = req.params.storeId;
  const alerts = await getExpiryAlerts(storeId);
  res.json(alerts);
}

export async function customerStoreProductsController(req: Request, res: Response) {
  const storeId = req.params.storeId;
  const products = await listStoreProductsForCustomers(storeId);
  res.json(products);
}

export async function ownerStoresController(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const stores = await listStoresForOwner(req.user.id);
  res.json(stores);
}
