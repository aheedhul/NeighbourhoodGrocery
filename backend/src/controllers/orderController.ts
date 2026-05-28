import type { Request, Response } from "express";
import { OrderStatus } from "@prisma/client";

import { createOrder } from "../services/orderService";
import { getOrderById, listCustomerOrders, listStoreOrders, updateOrderStatus } from "../services/orderService";
import { getStoreById } from "../services/storeService";
import { createOrderSchema, updateOrderStatusSchema } from "../validators/orderValidator";

export async function createOrderController(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const payload = createOrderSchema.parse(req.body);
  const order = await createOrder(req.user.id, payload);
  if (!order) {
    return res.status(500).json({ message: "Order created but could not be retrieved" });
  }
  res.status(201).json(order);
}

export async function listMyOrdersController(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const orders = await listCustomerOrders(req.user.id);
  res.json(orders);
}

export async function listStoreOrdersController(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const storeId = req.params.storeId;
  const store = await getStoreById(storeId);
  if (!store) {
    return res.status(404).json({ message: "Store not found" });
  }

  if (req.user.role !== "ADMIN" && store.ownerId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const orders = await listStoreOrders(storeId);
  res.json(orders);
}

export async function getOrderController(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const orderId = req.params.orderId;
  const order = await getOrderById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (req.user.role === "CUSTOMER" && order.customerId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (req.user.role === "OWNER") {
    const store = await getStoreById(order.storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    if (store.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  res.json(order);
}

export async function updateOrderStatusController(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const orderId = req.params.orderId;
  const payload = updateOrderStatusSchema.parse(req.body);
  const status = OrderStatus[payload.status as keyof typeof OrderStatus];

  if (!status) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  const existingOrder = await getOrderById(orderId);
  if (!existingOrder) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (req.user.role === "OWNER") {
    const store = await getStoreById(existingOrder.storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    if (store.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  const order = await updateOrderStatus(orderId, status);
  res.json(order);
}
