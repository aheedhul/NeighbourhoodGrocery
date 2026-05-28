import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

export const createOrderSchema = z.object({
  storeId: z.string().uuid(),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.COD),
  deliveryAddress: z.string().min(5),
  deliveryLatitude: z.number(),
  deliveryLongitude: z.number(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        inventoryItemId: z.string().uuid(),
        quantity: z.number().int().positive()
      })
    )
    .min(1)
});

export const updateOrderStatusSchema = z.object({
  status: z.string().min(1)
});
