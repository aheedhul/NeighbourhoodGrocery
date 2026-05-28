import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Grid, Group, Loader, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconTruckDelivery } from "@tabler/icons-react";

import { claimAssignment, fetchAssignments, updateAssignmentStatus } from "../api/delivery";
import { getApiError } from "../utils/errors";

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

const statusColors: Record<string, string> = {
  PENDING: "yellow",
  ASSIGNED: "blue",
  PICKED_UP: "orange",
  DELIVERED: "teal",
  CANCELLED: "red"
};

export default function DeliveryBoardPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadAssignments = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fetchAssignments();
      const normalized = (data as Assignment[]).map((assignment) => ({
        ...assignment,
        order: {
          ...assignment.order,
          total: Number(assignment.order.total)
        }
      }));
      setAssignments(normalized);
    } catch (err) {
      setFetchError(getApiError(err, "Failed to load assignments."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleClaim = async (assignmentId: string) => {
    setLoadingId(assignmentId);
    try {
      await claimAssignment(assignmentId);
      notifications.show({ title: "Accepted", message: "Delivery assignment claimed.", color: "teal" });
      await loadAssignments();
    } catch (err) {
      notifications.show({ title: "Error", message: getApiError(err), color: "red" });
    } finally {
      setLoadingId(null);
    }
  };

  const handleStatusUpdate = async (assignmentId: string, status: string) => {
    setLoadingId(assignmentId);
    try {
      await updateAssignmentStatus(assignmentId, status);
      notifications.show({ title: "Updated", message: `Status set to ${status.replace(/_/g, " ")}.`, color: "teal" });
      await loadAssignments();
    } catch (err) {
      notifications.show({ title: "Error", message: getApiError(err), color: "red" });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center">
        <div>
          <Title order={2}>Delivery Board</Title>
          <Text c="dimmed">Manage your active and pending delivery assignments.</Text>
        </div>
        <Button variant="light" radius="md" onClick={loadAssignments} loading={loading}>
          Refresh
        </Button>
      </Group>

      {fetchError && (
        <Alert icon={<IconAlertCircle />} color="red" radius="xl" title="Could not load assignments" withCloseButton onClose={() => setFetchError(null)}>
          {fetchError}
        </Alert>
      )}

      {loading ? (
        <Group justify="center" mt="xl">
          <Loader />
        </Group>
      ) : assignments.length === 0 ? (
        <Card withBorder radius="xl" p="xl" ta="center">
          <IconTruckDelivery size={48} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
          <Title order={4}>No assignments right now</Title>
          <Text c="dimmed" mt="xs" size="sm">New orders will appear here automatically.</Text>
        </Card>
      ) : (
        <Grid>
          {assignments.map((assignment: Assignment) => (
            <Grid.Col key={assignment.id} span={{ base: 12, md: 6, lg: 4 }}>
              <Card shadow="sm" withBorder radius="xl" p="xl">
                <Group justify="space-between" align="center" mb="sm">
                  <div>
                    <Text fw={700}>{assignment.order.store.name}</Text>
                    <Text size="xs" c="dimmed">
                      Order #{assignment.order.id.slice(0, 8).toUpperCase()}
                    </Text>
                  </div>
                  <Badge color={statusColors[assignment.status] ?? "gray"}>
                    {assignment.status.replace(/_/g, " ")}
                  </Badge>
                </Group>
                <Text size="sm" mb="xs">
                  <Text span fw={500}>Deliver to: </Text>{assignment.order.deliveryAddress}
                </Text>
                <Text size="sm" fw={600} mb="md">
                  ₹{assignment.order.total?.toFixed(2)}
                </Text>
                <Group gap="sm">
                  {assignment.status === "PENDING" && (
                    <Button size="xs" radius="md" loading={loadingId === assignment.id} onClick={() => handleClaim(assignment.id)}>
                      Accept
                    </Button>
                  )}
                  {assignment.status === "ASSIGNED" && (
                    <Button
                      size="xs"
                      radius="md"
                      color="orange"
                      loading={loadingId === assignment.id}
                      onClick={() => handleStatusUpdate(assignment.id, "PICKED_UP")}
                    >
                      Mark Picked Up
                    </Button>
                  )}
                  {assignment.status === "PICKED_UP" && (
                    <Button
                      size="xs"
                      radius="md"
                      color="teal"
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
      )}
    </Stack>
  );
}

