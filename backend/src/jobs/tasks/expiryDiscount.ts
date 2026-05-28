import { InventoryStatus } from "@prisma/client";

import config from "../../config/env";
import prisma from "../../config/prisma";
import { calculateDynamicPrice, computeDiscountForExpiry } from "../../utils/pricing";

export async function runExpiryDiscountSweep() {
  const items = await prisma.inventoryItem.findMany({
    where: {
      expiryDate: { not: null },
      quantity: { gt: 0 }
    },
    include: { product: true }
  });

  const now = new Date();

  for (const item of items) {
    if (!item.expiryDate) continue;

    const msUntilExpiry = item.expiryDate.getTime() - now.getTime();
    const daysUntilExpiry = Math.ceil(msUntilExpiry / (1000 * 60 * 60 * 24));

    let status: InventoryStatus = InventoryStatus.AVAILABLE;

    if (daysUntilExpiry <= 0) {
      status = InventoryStatus.EXPIRED;
    } else if (daysUntilExpiry <= config.minNearExpiryDays) {
      status = InventoryStatus.NEAR_EXPIRY;
    } else if (item.quantity < 5) {
      status = InventoryStatus.LOW_STOCK;
    }

    const discount = computeDiscountForExpiry(daysUntilExpiry, config.nearExpiryDiscounts);
    const dynamicPrice = calculateDynamicPrice(Number(item.product.basePrice), item.demandScore, discount);

    await prisma.inventoryItem.update({
      where: { id: item.id },
      data: {
        status,
        dynamicPrice,
        lastPriceUpdate: new Date()
      }
    });
  }
}
