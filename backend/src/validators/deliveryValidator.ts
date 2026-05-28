import { z } from "zod";
import { DeliveryStatus } from "@prisma/client";

export const updateDeliveryStatusSchema = z.object({
  status: z.nativeEnum(DeliveryStatus)
});
