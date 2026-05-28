import type { User } from "../types";
import client from "./client";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  name: string;
  role: "CUSTOMER" | "OWNER" | "DELIVERY";
};

export async function login(payload: LoginPayload) {
  const { data } = await client.post("/auth/login", payload);
  return data as { token: string; user: User };
}

export async function register(payload: RegisterPayload) {
  const { data } = await client.post("/auth/register", payload);
  return data as { token: string; user: User };
}
