import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Badge, Card, Group, Stack, Table, Text, Title } from "@mantine/core";

import { fetchStoreInventory, fetchStoreAlerts } from "../api/store";
import type { InventoryItem } from "../types";

export default function InventoryManagerPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<InventoryItem[]>([]);

  useEffect(() => {
    if (!storeId) return;
    fetchStoreInventory(storeId).then(setInventory);
    fetchStoreAlerts(storeId).then(setAlerts);
  }, [storeId]);

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center">
        <Title order={2}>Inventory Control</Title>
        <Text c="dimmed">Store ID: {storeId}</Text>
      </Group>

      <Card withBorder radius="md" shadow="sm">
        <Title order={4} mb="md">
          Expiry & Smart Discount Alerts
        </Title>
        <Stack gap="xs">
          {alerts.map((item: InventoryItem) => (
            <Group key={item.id} justify="space-between">
              <Text size="sm">{item.product.name}</Text>
              <Badge color="orange">{item.status}</Badge>
            </Group>
          ))}
          {alerts.length === 0 && <Text size="sm">You are all clear. No near-expiry items.</Text>}
        </Stack>
      </Card>

      <Card withBorder radius="md" shadow="sm">
        <Title order={4} mb="md">
          Live Inventory Matrix
        </Title>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Product</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th ta="right">Quantity</Table.Th>
              <Table.Th ta="right">Dynamic Price</Table.Th>
              <Table.Th ta="right">Expiry</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {inventory.map((item: InventoryItem) => (
              <Table.Tr key={item.id}>
                <Table.Td>{item.product.name}</Table.Td>
                <Table.Td>
                  <Badge color={item.status === "AVAILABLE" ? "green" : item.status === "LOW_STOCK" ? "yellow" : "orange"}>
                    {item.status}
                  </Badge>
                </Table.Td>
                <Table.Td ta="right">{item.quantity}</Table.Td>
                <Table.Td ta="right">₹{item.dynamicPrice.toFixed(2)}</Table.Td>
                <Table.Td ta="right">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : ""}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
}
