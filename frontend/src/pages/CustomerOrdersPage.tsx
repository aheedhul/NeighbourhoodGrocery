import { useEffect, useState } from "react";
import {
  Badge,
  Card,
  Divider,
  Grid,
  Group,
  Loader,
  Paper,
  Stack,
  Stepper,
  Text,
  ThemeIcon,
  Title
} from "@mantine/core";
import { IconPackage } from "@tabler/icons-react";

import { fetchMyOrders } from "../api/order";
import type { Order, OrderItem } from "../types";

const statusColors: Record<Order["status"], string> = {
  PENDING: "yellow",
  CONFIRMED: "blue",
  PREPARING: "cyan",
  OUT_FOR_DELIVERY: "orange",
  COMPLETED: "teal",
  CANCELLED: "red"
};

const statusSteps = ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "COMPLETED"] as const;

function getStepIndex(status: Order["status"]) {
  const idx = statusSteps.indexOf(status as (typeof statusSteps)[number]);
  return idx === -1 ? 0 : idx;
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .catch(() => {
        // orders failed silently — loading state clears and empty state shows
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Group justify="center" mt="xl">
        <Loader />
      </Group>
    );
  }

  return (
    <Stack gap="xl">
      <div>
        <Title order={2}>My Orders</Title>
        <Text c="dimmed">Track all your orders and their current status.</Text>
      </div>

      {orders.length === 0 ? (
        <Card withBorder radius="xl" p="xl" ta="center">
          <ThemeIcon size={64} radius="xl" variant="light" color="brand" style={{ margin: "0 auto 1rem" }}>
            <IconPackage size={32} />
          </ThemeIcon>
          <Title order={4}>No orders yet</Title>
          <Text c="dimmed" mt="xs">Start shopping at your nearest store.</Text>
        </Card>
      ) : (
        <Stack gap="lg">
          {orders.map((order: Order) => (
            <Card key={order.id} withBorder radius="xl" shadow="sm" p="xl">
              <Group justify="space-between" align="flex-start" mb="md">
                <div>
                  <Text fw={700} size="lg">Order #{order.id.slice(0, 8).toUpperCase()}</Text>
                  <Text size="xs" c="dimmed">{new Date(order.createdAt).toLocaleString()}</Text>
                </div>
                <Group gap="sm">
                  <Badge color={statusColors[order.status as Order["status"]]} size="lg">
                    {order.status.replace(/_/g, " ")}
                  </Badge>
                  <Badge variant="light" color="brand" size="lg">{order.paymentMethod}</Badge>
                </Group>
              </Group>

              {order.status !== "CANCELLED" && (
                <Stepper
                  active={getStepIndex(order.status)}
                  size="xs"
                  mb="md"
                  color={order.status === "COMPLETED" ? "teal" : "brand"}
                >
                  <Stepper.Step label="Pending" />
                  <Stepper.Step label="Confirmed" />
                  <Stepper.Step label="Preparing" />
                  <Stepper.Step label="Out for delivery" />
                  <Stepper.Step label="Delivered" />
                </Stepper>
              )}

              <Divider mb="md" />

              <Grid>
                <Grid.Col span={{ base: 12, md: 7 }}>
                  <Text fw={600} size="sm" mb="xs">Items</Text>
                  <Stack gap={6}>
                    {order.items.map((item: OrderItem) => (
                      <Paper key={item.id} p="xs" radius="md" withBorder>
                        <Group justify="space-between">
                          <Text size="sm">{item.product.name}</Text>
                          <Group gap="xs">
                            <Text size="sm" c="dimmed">{item.quantity} ×</Text>
                            <Text size="sm" fw={600}>₹{item.unitPrice.toFixed(2)}</Text>
                          </Group>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 5 }}>
                  <Text fw={600} size="sm" mb="xs">Summary</Text>
                  <Paper p="md" radius="md" withBorder>
                    <Stack gap={6}>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">Subtotal</Text>
                        <Text size="sm">₹{order.subtotal.toFixed(2)}</Text>
                      </Group>
                      {order.discountTotal > 0 && (
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">Discounts</Text>
                          <Text size="sm" c="teal">−₹{order.discountTotal.toFixed(2)}</Text>
                        </Group>
                      )}
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">Delivery fee</Text>
                        <Text size="sm">₹{order.deliveryFee.toFixed(2)}</Text>
                      </Group>
                      <Divider />
                      <Group justify="space-between">
                        <Text fw={700}>Total</Text>
                        <Text fw={700} c="brand">₹{order.total.toFixed(2)}</Text>
                      </Group>
                    </Stack>
                  </Paper>
                  <Text size="xs" c="dimmed" mt="xs">
                    Deliver to: {order.deliveryAddress}
                  </Text>
                </Grid.Col>
              </Grid>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

