import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      message: "Validation error",
      errors: err.errors.map((e) => ({ path: e.path.join("."), message: e.message }))
    });
  }

  if (err instanceof Error) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }

  return res.status(500).json({ message: "Unexpected server error" });
}
