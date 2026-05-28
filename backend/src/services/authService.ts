import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { UserRole } from "@prisma/client";

import config from "../config/env";
import prisma from "../config/prisma";

const SALT_ROUNDS = 10;

export async function registerUser(params: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  latitude?: number;
  longitude?: number;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
}) {
  const existing = await prisma.user.findUnique({ where: { email: params.email } });
  if (existing) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(params.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: params.name,
      email: params.email,
      passwordHash,
      role: params.role,
      phone: params.phone,
      latitude: params.latitude,
      longitude: params.longitude,
      addressLine1: params.address?.addressLine1,
      addressLine2: params.address?.addressLine2,
      city: params.address?.city,
      state: params.address?.state,
      postalCode: params.address?.postalCode
    }
  });

  const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: "12h" });

  return { user, token };
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: "12h" });

  return { user, token };
}
