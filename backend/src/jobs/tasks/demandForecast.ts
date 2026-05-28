import { OrderStatus } from "@prisma/client";

import config from "../../config/env";
import prisma from "../../config/prisma";
import { calculateDynamicPrice, computeDiscountForExpiry } from "../../utils/pricing";

export async function runDemandForecastSweep() {
  const now = new Date();
  const horizon = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);

  const inventoryItems = await prisma.inventoryItem.findMany({
    include: {
      product: true
    }
  });

  for (const item of inventoryItems) {
    const orderAggregate = await prisma.orderItem.aggregate({
      _sum: { quantity: true },
      where: {
        productId: item.productId,
        order: {
          storeId: item.storeId,
          createdAt: { gte: horizon },
          status: {
            in: [
              OrderStatus.CONFIRMED,
              OrderStatus.PREPARING,
              OrderStatus.OUT_FOR_DELIVERY,
              OrderStatus.COMPLETED
            ]
          }
        }
      }
    });

    const totalSold = orderAggregate._sum.quantity ?? 0;
    const dailyAverage = totalSold / 30;
    const normalizedDemand = Math.tanh(dailyAverage / 4) * 0.5 - 0.1;

    let expiryDiscount = 0;
    if (item.expiryDate) {
      const daysUntilExpiry = Math.ceil((item.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      expiryDiscount = computeDiscountForExpiry(daysUntilExpiry, config.nearExpiryDiscounts);
    }

    const dynamicPrice = calculateDynamicPrice(Number(item.product.basePrice), normalizedDemand, expiryDiscount);

    await prisma.inventoryItem.update({
      where: { id: item.id },
      data: {
        demandScore: normalizedDemand,
        dynamicPrice,
        lastPriceUpdate: now
      }
    });
  }
}
