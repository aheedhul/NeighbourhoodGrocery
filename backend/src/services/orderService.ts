import { OrderStatus, PaymentMethod, Prisma } from "@prisma/client";

import prisma from "../config/prisma";
import { serializeOrder } from "../utils/serializers";

export type CreateOrderInput = {
  storeId: string;
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  notes?: string;
  items: Array<{
    inventoryItemId: string;
    quantity: number;
  }>;
};

export async function createOrder(customerId: string, input: CreateOrderInput) {
  const store = await prisma.store.findUnique({ where: { id: input.storeId } });
  if (!store) {
    throw new Error("Store not found");
  }

  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      id: { in: input.items.map((i) => i.inventoryItemId) },
      storeId: input.storeId
    },
    include: { product: true }
  });

  if (inventoryItems.length !== input.items.length) {
    throw new Error("One or more inventory items not found");
  }

  let subtotal = 0;
  let baseTotal = 0;

  const lineItems = input.items.map((line) => {
    const inventory = inventoryItems.find(
      (inventoryItem: (typeof inventoryItems)[number]) => inventoryItem.id === line.inventoryItemId
    );
    if (!inventory) {
      throw new Error("Inventory item mismatch");
    }

    if (inventory.quantity < line.quantity) {
      throw new Error(`Insufficient stock for ${inventory.product.name}`);
    }

    const price = Number(inventory.dynamicPrice || inventory.product.basePrice);
    const basePrice = Number(inventory.product.basePrice);
    const lineSubtotal = price * line.quantity;
    subtotal += lineSubtotal;
    baseTotal += basePrice * line.quantity;

    return {
      inventory,
      quantity: line.quantity,
      price,
      basePrice
    };
  });

  if (subtotal < Number(store.minOrderValue)) {
    throw new Error(`Minimum order value is ₹${Number(store.minOrderValue).toFixed(2)}`);
  }

  const discountTotal = Math.max(baseTotal - subtotal, 0);
  const deliveryFee = Number(store.minOrderValue) * 0.05;
  const total = subtotal + deliveryFee;

  const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const orderRecord = await tx.order.create({
      data: {
        storeId: input.storeId,
        customerId,
        status: OrderStatus.PENDING,
        paymentMethod: input.paymentMethod,
        subtotal: new Prisma.Decimal(subtotal),
        discountTotal: new Prisma.Decimal(discountTotal),
        deliveryFee: new Prisma.Decimal(deliveryFee),
        total: new Prisma.Decimal(total),
        deliveryAddress: input.deliveryAddress,
        deliveryLatitude: input.deliveryLatitude,
        deliveryLongitude: input.deliveryLongitude,
        notes: input.notes
      }
    });

    for (const line of lineItems) {
      await tx.orderItem.create({
        data: {
          orderId: orderRecord.id,
          productId: line.inventory.productId,
          quantity: line.quantity,
          unitPrice: new Prisma.Decimal(line.price),
          discount: new Prisma.Decimal(line.basePrice - line.price),
          finalPrice: new Prisma.Decimal(line.price * line.quantity),
          expiryDate: line.inventory.expiryDate ?? undefined
        }
      });

      await tx.inventoryItem.update({
        where: { id: line.inventory.id },
        data: {
          quantity: line.inventory.quantity - line.quantity,
          reservedQuantity: line.inventory.reservedQuantity + line.quantity
        }
      });

      await tx.inventoryEvent.create({
        data: {
          inventoryItemId: line.inventory.id,
          changeType: "ORDER_RESERVED",
          quantityChange: -line.quantity,
          notes: `Reserved for order ${orderRecord.id}`
        }
      });
    }

    await tx.deliveryAssignment.create({
      data: {
        orderId: orderRecord.id,
        status: "PENDING"
      }
    });

    const totalQty = lineItems.reduce((acc, item) => acc + item.quantity, 0);
    const predictedDemand = totalQty * 1.5;

    await tx.demandForecast.create({
      data: {
        orderId: orderRecord.id,
        horizonDays: 7,
        predictedDemand,
        explanation: "Heuristic forecast based on current basket volume"
      }
    });

    return orderRecord;
  });

  const persistedOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      items: { include: { product: true } },
      delivery: true
    }
  });

  if (!persistedOrder) {
    return null;
  }

  return serializeOrder({ ...persistedOrder, items: persistedOrder.items });
}

export async function listCustomerOrders(customerId: string) {
  const orders = await prisma.order.findMany({
    where: { customerId },
    include: { items: { include: { product: true } }, delivery: true },
    orderBy: { createdAt: "desc" }
  });

  return orders.map((order: (typeof orders)[number]) => serializeOrder({ ...order, items: order.items }));
}

export async function listStoreOrders(storeId: string) {
  const orders = await prisma.order.findMany({
    where: { storeId },
    include: { items: { include: { product: true } }, customer: true, delivery: true },
    orderBy: { createdAt: "desc" }
  });

  return orders.map((order: (typeof orders)[number]) => serializeOrder({ ...order, items: order.items }));
}

export async function getOrderById(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, delivery: true, store: true }
  });

  if (!order) return null;

  return serializeOrder({ ...order, items: order.items });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { items: { include: { product: true } }, delivery: true }
  });

  return serializeOrder({ ...order, items: order.items });
}
