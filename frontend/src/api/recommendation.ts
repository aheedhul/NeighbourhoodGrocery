import type { Recommendation } from "../types";
import client from "./client";

export async function fetchPersonalizedRecommendations(storeId?: string) {
  const { data } = await client.get("/recommendations/personalized", {
    params: storeId ? { storeId } : undefined
  });

  return data as Recommendation[];
}
