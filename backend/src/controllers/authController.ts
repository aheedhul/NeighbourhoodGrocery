import type { Request, Response } from "express";

import { authenticateUser, registerUser } from "../services/authService";
import { loginSchema, registerSchema } from "../validators/authValidator";

export async function register(req: Request, res: Response) {
  const payload = registerSchema.parse(req.body);
  const result = await registerUser(payload);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const payload = loginSchema.parse(req.body);
  const result = await authenticateUser(payload.email, payload.password);
  res.json(result);
}
