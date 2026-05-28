import type { InventoryItem, StoreSummary, Store } from "../types";
import client from "./client";

export type CreateStorePayload = {
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

export async function createStore(payload: CreateStorePayload) {
  const { data } = await client.post("/stores", payload);
  return data;
}

export async function fetchNearbyStores(latitude: number, longitude: number, radiusKm?: number) {
  const { data } = await client.get("/stores", { params: { latitude, longitude, radiusKm } });
  return data as StoreSummary[];
}

export async function fetchStoreInventory(storeId: string) {
  const { data } = await client.get(`/stores/${storeId}/inventory`);
  return data as InventoryItem[];
}

export async function fetchOwnerStores() {
  const { data } = await client.get("/stores/owned");
  return data as Store[];
}

export async function uploadInventory(storeId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await client.post(`/stores/${storeId}/inventory/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data as {
    createdInventory: number;
    updatedInventory: number;
    newCatalogItems: number;
    rowsProcessed: number;
  };
}

export async function fetchStoreAlerts(storeId: string) {
  const { data } = await client.get(`/stores/${storeId}/alerts`);
  return data as InventoryItem[];
}

export async function fetchStoreProducts(storeId: string) {
  const { data } = await client.get(`/stores/${storeId}/products`);
  return data as InventoryItem[];
}
