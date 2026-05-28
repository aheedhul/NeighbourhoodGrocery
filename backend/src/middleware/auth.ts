import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { UserRole } from "@prisma/client";

import config from "../config/env";

export type JwtPayload = {
  id: string;
  role: UserRole;
};

export function authenticate(allowedRoles?: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = header.replace("Bearer ", "");

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      req.user = decoded;

      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}
