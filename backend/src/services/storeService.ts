import { Prisma } from "@prisma/client";

import prisma from "../config/prisma";
import { haversineDistanceKm } from "../utils/geo";

type StoreInput = {
  name: string;
  description?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  deliveryRadiusKm?: number;
  minOrderValue?: number;
};

export async function createStore(ownerId: string, input: StoreInput) {
  return prisma.store.create({
    data: {
      ownerId,
      name: input.name,
      description: input.description,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      latitude: input.latitude,
      longitude: input.longitude,
      deliveryRadiusKm: input.deliveryRadiusKm ?? 8,
      minOrderValue: new Prisma.Decimal(input.minOrderValue ?? 200)
    }
  });
}

type NearbyStoreResult = {
  id: string;
  name: string;
  distanceKm: number;
  minOrderValue: number;
  deliveryRadiusKm: number;
  city: string;
  state: string;
};

export async function listStoresNearby(latitude: number, longitude: number, radiusKm = 10): Promise<NearbyStoreResult[]> {
  const stores = await prisma.store.findMany();
  const results: NearbyStoreResult[] = [];

  for (const store of stores) {
    const distanceKm = haversineDistanceKm(latitude, longitude, store.latitude, store.longitude);

    if (distanceKm <= radiusKm) {
      results.push({
        id: store.id,
        name: store.name,
        distanceKm: Number(distanceKm.toFixed(2)),
        minOrderValue: Number(store.minOrderValue),
        deliveryRadiusKm: store.deliveryRadiusKm,
        city: store.city,
        state: store.state
      });
    }
  }

  return results.sort((a, b) => a.distanceKm - b.distanceKm);
}

export async function getStoreById(storeId: string) {
  return prisma.store.findUnique({ where: { id: storeId } });
}

export async function listStoresForOwner(ownerId: string) {
  const stores = await prisma.store.findMany({ where: { ownerId } });
  return stores.map((store: (typeof stores)[number]) => ({
    ...store,
    minOrderValue: Number(store.minOrderValue)
  }));
}
