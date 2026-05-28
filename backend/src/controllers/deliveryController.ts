import type { Request, Response } from "express";
import { DeliveryStatus } from "@prisma/client";

import { claimAssignment, listAssignmentsForStaff, updateDeliveryStatus } from "../services/deliveryService";
import { updateDeliveryStatusSchema } from "../validators/deliveryValidator";

export async function listAssignmentsController(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const assignments = await listAssignmentsForStaff(req.user.id);
  res.json(assignments);
}

export async function claimAssignmentController(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const assignmentId = req.params.assignmentId;
  const assignment = await claimAssignment(assignmentId, req.user.id);
  res.json(assignment);
}

export async function updateDeliveryStatusController(req: Request, res: Response) {
  const assignmentId = req.params.assignmentId;
  const payload = updateDeliveryStatusSchema.parse(req.body);
  const assignment = await updateDeliveryStatus(assignmentId, payload.status as DeliveryStatus);
  res.json(assignment);
}
