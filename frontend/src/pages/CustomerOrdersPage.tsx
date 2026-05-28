import { useEffect, useState } from "react";
import { Badge, Card, Grid, Group, Loader, Stack, Text, Title } from "@mantine/core";

import { fetchMyOrders } from "../api/order";
import type { Order, OrderItem } from "../types";

const statusColors: Record<Order["status"], string> = {
  PENDING: "yellow",
  CONFIRMED: "blue",
  PREPARING: "cyan",
  OUT_FOR_DELIVERY: "orange",
  COMPLETED: "green",
  CANCELLED: "red"
};

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Group justify="center">
        <Loader />
      </Group>
    );
  }

  return (
    <Stack gap="lg">
      <Title order={2}>My Orders</Title>
      <Grid>
        {orders.map((order: Order) => (
          <Grid.Col key={order.id} span={{ base: 12, md: 6, lg: 4 }}>
            <Card withBorder radius="md" shadow="sm">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text fw={600}>Order #{order.id.slice(0, 6)}</Text>
                  <Text size="xs" c="dimmed">
                    {new Date(order.createdAt).toLocaleString()}
                  </Text>
                </div>
                <Badge color={statusColors[order.status as Order["status"]]}>{order.status.replace(/_/g, " ")}</Badge>
              </Group>
              <Stack gap="xs" mt="md">
                {order.items.map((item: OrderItem) => (
                  <Group key={item.id} justify="space-between">
                    <Text size="sm">{item.product.name}</Text>
                    <Text size="sm">{item.quantity} pcs</Text>
                  </Group>
                ))}
              </Stack>
              <Text fw={600} mt="md">
                Total: ₹{order.total.toFixed(2)}
              </Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
