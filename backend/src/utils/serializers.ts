import type { InventoryItem, Order, OrderItem, Product } from "@prisma/client";
import { Prisma } from "@prisma/client";

type DecimalLike = Prisma.Decimal | number | null | undefined;

type InventoryWithProduct = InventoryItem & {
  product: Product & { basePrice: Prisma.Decimal };
};

type OrderWithRelations = Order & {
  items: Array<
    OrderItem & {
      product: Product;
    }
  >;
};

function toNumber(value: DecimalLike): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return value.toNumber();
}

export function serializeInventoryItem(item: InventoryWithProduct) {
  return {
    ...item,
    quantity: item.quantity,
    dynamicPrice: toNumber(item.dynamicPrice),
    demandScore: item.demandScore,
    product: {
      ...item.product,
      basePrice: toNumber(item.product.basePrice)
    }
  };
}

export function serializeOrder(order: OrderWithRelations) {
  return {
    ...order,
    subtotal: toNumber(order.subtotal),
    discountTotal: toNumber(order.discountTotal),
    deliveryFee: toNumber(order.deliveryFee),
    total: toNumber(order.total),
    items: order.items.map((item: OrderWithRelations["items"][number]) => ({
      ...item,
      unitPrice: toNumber(item.unitPrice),
      discount: toNumber(item.discount),
      finalPrice: toNumber(item.finalPrice)
    }))
  };
}
