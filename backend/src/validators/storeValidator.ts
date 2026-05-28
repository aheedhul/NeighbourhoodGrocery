import { z } from "zod";

export const createStoreSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4),
  latitude: z.number(),
  longitude: z.number(),
  deliveryRadiusKm: z.number().optional(),
  minOrderValue: z.number().optional()
});

export const nearbyStoreSchema = z.object({
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  radiusKm: z.coerce.number().optional()
});
