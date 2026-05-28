import { z } from "zod";
import { UserRole } from "@prisma/client";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole),
  phone: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z
    .object({
      addressLine1: z.string().optional(),
      addressLine2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional()
    })
    .optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
