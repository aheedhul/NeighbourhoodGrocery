import { DeliveryStatus } from "@prisma/client";

import prisma from "../config/prisma";
import { serializeOrder } from "../utils/serializers";

export async function listAssignmentsForStaff(staffId: string) {
  const assignments = await prisma.deliveryAssignment.findMany({
    where: {
      OR: [{ deliveryStaffId: staffId }, { deliveryStaffId: null }]
    },
    include: {
      order: {
        include: {
          store: true,
          items: { include: { product: true } }
        }
      }
    },
    orderBy: { assignedAt: "asc" }
  });

  return assignments.map((assignment: (typeof assignments)[number]) => ({
    ...assignment,
    order: serializeOrder({ ...assignment.order, items: assignment.order.items })
  }));
}

export async function claimAssignment(assignmentId: string, staffId: string) {
  return prisma.deliveryAssignment.update({
    where: { id: assignmentId },
    data: {
      deliveryStaffId: staffId,
      status: DeliveryStatus.ASSIGNED,
      assignedAt: new Date()
    }
  });
}

export async function updateDeliveryStatus(assignmentId: string, status: DeliveryStatus) {
  const timestamps: Partial<{ pickedUpAt: Date; deliveredAt: Date }> = {};

  if (status === DeliveryStatus.PICKED_UP) {
    timestamps.pickedUpAt = new Date();
  }

  if (status === DeliveryStatus.DELIVERED) {
    timestamps.deliveredAt = new Date();
  }

  return prisma.deliveryAssignment.update({
    where: { id: assignmentId },
    data: {
      status,
      ...timestamps
    }
  });
}
