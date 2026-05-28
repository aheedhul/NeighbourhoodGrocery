type DiscountRule = {
  threshold: number;
  discount: number;
};

export function computeDiscountForExpiry(daysUntilExpiry: number, rules: DiscountRule[]): number {
  const sorted = [...rules].sort((a, b) => a.threshold - b.threshold);

  for (const rule of sorted) {
    if (daysUntilExpiry <= rule.threshold) {
      return rule.discount;
    }
  }

  return 0;
}

export function calculateDynamicPrice(basePrice: number, demandScore: number, expiryDiscount: number): number {
  const boundedDemand = Math.min(Math.max(demandScore, -0.3), 0.4);
  const demandMultiplier = 1 + boundedDemand;
  const discountMultiplier = 1 - Math.min(Math.max(expiryDiscount, 0), 0.8);
  const price = basePrice * demandMultiplier * discountMultiplier;
  return Math.max(Number(price.toFixed(2)), 0);
}
