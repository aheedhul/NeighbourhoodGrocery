import type { Request, Response } from "express";

import { getPersonalizedRecommendations } from "../services/recommendationService";

export async function personalizedRecommendationsController(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const storeId = req.query.storeId ? String(req.query.storeId) : undefined;
  const recommendations = await getPersonalizedRecommendations(req.user.id, storeId);
  res.json(recommendations);
}
