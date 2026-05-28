import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Table,
  Text,
  Title
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

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
        <div>
          <Title order={2}>Inventory Control</Title>
          <Text c="dimmed" size="sm">Store ID: {storeId}</Text>
        </div>
        <Button component={Link} to="/owner/dashboard" variant="subtle" leftSection={<IconArrowLeft size={16} />} radius="md">
          Back to console
        </Button>
      </Group>

      <Card withBorder radius="xl" p="xl">
        <Title order={4} mb="md">Expiry &amp; Smart Discount Alerts</Title>
        {alerts.length === 0 ? (
          <Text size="sm" c="dimmed">You are all clear. No near-expiry items.</Text>
        ) : (
          <Stack gap="xs">
            {alerts.map((item: InventoryItem) => (
              <Group key={item.id} justify="space-between" p="sm" style={{ borderBottom: "1px solid rgba(67,97,238,0.08)" }}>
                <div>
                  <Text size="sm" fw={500}>{item.product.name}</Text>
                  {item.expiryDate && (
                    <Text size="xs" c="dimmed">Expires {new Date(item.expiryDate).toLocaleDateString()}</Text>
                  )}
                  <Text size="xs" c="dimmed">
                    Base ₹{item.product.basePrice.toFixed(2)} → Dynamic ₹{item.dynamicPrice.toFixed(2)}
                  </Text>
                </div>
                <Badge color="orange">{item.status.replace(/_/g, " ")}</Badge>
              </Group>
            ))}
          </Stack>
        )}
      </Card>

      <Card withBorder radius="xl" p="xl">
        <Title order={4} mb="md">Live Inventory Matrix</Title>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Product</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th ta="right">Quantity</Table.Th>
              <Table.Th ta="right">Dynamic Price</Table.Th>
              <Table.Th ta="right">Expiry</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {inventory.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text size="sm" c="dimmed" ta="center" py="lg">No inventory data.</Text>
                </Table.Td>
              </Table.Tr>
            )}
            {inventory.map((item: InventoryItem) => (
              <Table.Tr key={item.id}>
                <Table.Td fw={500}>{item.product.name}</Table.Td>
                <Table.Td>{item.product.category ?? "—"}</Table.Td>
                <Table.Td>
                  <Badge
                    color={
                      item.status === "AVAILABLE" ? "teal" :
                      item.status === "LOW_STOCK" ? "yellow" :
                      item.status === "NEAR_EXPIRY" ? "orange" : "red"
                    }
                  >
                    {item.status.replace(/_/g, " ")}
                  </Badge>
                </Table.Td>
                <Table.Td ta="right">{item.quantity}</Table.Td>
                <Table.Td ta="right">₹{item.dynamicPrice.toFixed(2)}</Table.Td>
                <Table.Td ta="right">
                  {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "—"}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
}

