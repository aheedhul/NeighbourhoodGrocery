import { OrderStatus } from "@prisma/client";

import prisma from "../config/prisma";
import { serializeInventoryItem } from "../utils/serializers";

export async function getPersonalizedRecommendations(customerId: string, storeId?: string, limit = 10) {
  const orders = await prisma.order.findMany({
    where: {
      customerId,
      status: {
        in: [OrderStatus.COMPLETED, OrderStatus.OUT_FOR_DELIVERY]
      }
    },
    include: {
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  const categoryWeight = new Map<string, number>();
  const productWeight = new Map<string, number>();

  for (const order of orders) {
    for (const item of order.items) {
      if (item.product.category) {
        categoryWeight.set(item.product.category, (categoryWeight.get(item.product.category) ?? 0) + item.quantity);
      }
      productWeight.set(item.productId, (productWeight.get(item.productId) ?? 0) + item.quantity);
    }
  }

  const targetStoreId = storeId ?? orders[0]?.storeId;

  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      storeId: targetStoreId ?? undefined,
      quantity: { gt: 0 },
      status: { not: "EXPIRED" }
    },
    include: { product: true }
  });

  const recommendations = inventoryItems
    .map((inventory: (typeof inventoryItems)[number]) => {
      const serialized = serializeInventoryItem(inventory as any);
      const baseScore = inventory.recommendationScore ?? 0;
      const productScore = productWeight.get(inventory.productId) ?? 0;
      const categoryScore = inventory.product.category
        ? categoryWeight.get(inventory.product.category) ?? 0
        : 0;
      const freshnessScore = inventory.expiryDate
        ? 1 / (1 + Math.exp(-(inventory.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0.5;
      const finalScore = baseScore + productScore * 1.5 + categoryScore * 0.7 + freshnessScore;

      return {
        inventoryId: inventory.id,
        productId: inventory.productId,
        name: inventory.product.name,
        category: inventory.product.category,
        dynamicPrice: serialized.dynamicPrice,
        basePrice: serialized.product.basePrice,
        score: Number(finalScore.toFixed(3)),
        expiryDate: inventory.expiryDate
      };
    })
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
    .slice(0, limit);

  return recommendations;
}
