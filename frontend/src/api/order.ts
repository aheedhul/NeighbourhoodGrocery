import type { Order } from "../types";
import client from "./client";

export type OrderItemInput = {
  inventoryItemId: string;
  quantity: number;
};

export type CreateOrderPayload = {
  storeId: string;
  items: OrderItemInput[];
  paymentMethod: "COD" | "ONLINE";
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  notes?: string;
};

export async function createOrder(payload: CreateOrderPayload) {
  const { data } = await client.post("/orders", payload);
  return data as Order;
}

export async function fetchMyOrders() {
  const { data } = await client.get("/orders/mine");
  return data as Order[];
}

export async function fetchStoreOrders(storeId: string) {
  const { data } = await client.get(`/orders/store/${storeId}`);
  return data as Order[];
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { data } = await client.patch(`/orders/${orderId}/status`, { status });
  return data as Order;
}
