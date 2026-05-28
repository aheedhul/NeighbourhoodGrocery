import { useEffect, useState } from "react";
import { Badge, Button, Card, Grid, Group, Stack, Text, Title } from "@mantine/core";

import { claimAssignment, fetchAssignments, updateAssignmentStatus } from "../api/delivery";

type Assignment = {
  id: string;
  status: string;
  order: {
    id: string;
    deliveryAddress: string;
    total: number;
    store: {
      name: string;
    };
  };
};

export default function DeliveryBoardPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const loadAssignments = async () => {
    const data = await fetchAssignments();
    const normalized = (data as Assignment[]).map((assignment) => ({
      ...assignment,
      order: {
        ...assignment.order,
        total: Number(assignment.order.total)
      }
    }));
    setAssignments(normalized);
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleClaim = async (assignmentId: string) => {
    setLoadingId(assignmentId);
    await claimAssignment(assignmentId);
    await loadAssignments();
    setLoadingId(null);
  };

  const handleStatusUpdate = async (assignmentId: string, status: string) => {
    setLoadingId(assignmentId);
    await updateAssignmentStatus(assignmentId, status);
    await loadAssignments();
    setLoadingId(null);
  };

  return (
    <Stack gap="xl">
      <Title order={2}>Delivery Board</Title>
      <Grid>
        {assignments.map((assignment: Assignment) => (
          <Grid.Col key={assignment.id} span={{ base: 12, md: 6, lg: 4 }}>
            <Card shadow="sm" withBorder radius="md">
              <Group justify="space-between" align="center">
                <div>
                  <Text fw={600}>{assignment.order.store.name}</Text>
                  <Text size="sm" c="dimmed">
                    Order #{assignment.order.id.slice(0, 6)}
                  </Text>
                </div>
                <Badge>{assignment.status}</Badge>
              </Group>
              <Text size="sm" mt="sm">
                Deliver to: {assignment.order.deliveryAddress}
              </Text>
              <Text size="sm">Order total: ₹{assignment.order.total?.toFixed(2)}</Text>
              <Group mt="md" gap="sm">
                {assignment.status === "PENDING" && (
                  <Button size="xs" loading={loadingId === assignment.id} onClick={() => handleClaim(assignment.id)}>
                    Accept
                  </Button>
                )}
                {assignment.status === "ASSIGNED" && (
                  <Button
                    size="xs"
                    loading={loadingId === assignment.id}
                    onClick={() => handleStatusUpdate(assignment.id, "PICKED_UP")}
                  >
                    Mark Picked Up
                  </Button>
                )}
                {assignment.status === "PICKED_UP" && (
                  <Button
                    size="xs"
                    loading={loadingId === assignment.id}
                    onClick={() => handleStatusUpdate(assignment.id, "DELIVERED")}
                  >
                    Mark Delivered
                  </Button>
                )}
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
