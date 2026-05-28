import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  NativeSelect,
  Paper,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title
} from "@mantine/core";
import { IconAlertTriangle, IconCloudUpload, IconPackage, IconTrendingUp } from "@tabler/icons-react";

import { fetchOwnerStores, fetchStoreAlerts, fetchStoreInventory, uploadInventory } from "../api/store";
import type { InventoryItem, Store } from "../types";

export default function OwnerDashboardPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<InventoryItem[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchOwnerStores().then((data) => {
      setStores(data);
      if (data.length > 0) {
        setSelectedStoreId(data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedStoreId) return;
    fetchStoreInventory(selectedStoreId).then(setInventory);
    fetchStoreAlerts(selectedStoreId).then(setAlerts);
  }, [selectedStoreId]);

  const lowStock = useMemo(() => inventory.filter((item) => item.quantity < 10), [inventory]);

  const handleInventoryUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!selectedStoreId) return;
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const summary = await uploadInventory(selectedStoreId, file);
      const [inventoryData, alertData] = await Promise.all([
        fetchStoreInventory(selectedStoreId),
        fetchStoreAlerts(selectedStoreId)
      ]);
      setInventory(inventoryData);
      setAlerts(alertData);
      window.alert(
        `Inventory upload processed ${summary.rowsProcessed} rows. New catalog items: ${summary.newCatalogItems}, inventory created: ${summary.createdInventory}, inventory updated: ${summary.updatedInventory}.`
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Stack gap="xl">
      <Card padding="xl" radius="xl" withBorder>
        <Group justify="space-between" align="center" wrap="wrap" gap="lg">
          <div>
            <Title order={2}>Owner Console</Title>
            <Text c="dimmed">Command inventory strategy, expiry mitigation, and fulfilment readiness.</Text>
          </div>
          {stores.length > 0 && (
            <NativeSelect
              label="Active store"
              data={stores.map((store: Store) => ({ value: store.id, label: store.name }))}
              value={selectedStoreId ?? (stores[0]?.id ?? "")}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => setSelectedStoreId(event.currentTarget.value)}
              radius="md"
            />
          )}
        </Group>

        <Grid mt="xl" gutter="xl">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper radius="xl" p="lg" withBorder>
              <Group justify="space-between">
                <ThemeIcon variant="gradient" gradient={{ from: "brand.4", to: "brand.7" }} size="xl" radius="lg">
                  <IconPackage size={22} />
                </ThemeIcon>
                <Text size="xs" c="dimmed">
                  Updated just now
                </Text>
              </Group>
              <Title order={3} mt="sm">
                {inventory.length}
              </Title>
              <Text size="sm" c="dimmed">
                Active SKUs in catalogue
              </Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper radius="xl" p="lg" withBorder>
              <Group justify="space-between">
                <ThemeIcon variant="gradient" gradient={{ from: "orange", to: "yellow" }} size="xl" radius="lg">
                  <IconAlertTriangle size={22} />
                </ThemeIcon>
                <Text size="xs" c="dimmed">
                  Smart threshold
                </Text>
              </Group>
              <Title order={3} mt="sm">
                {lowStock.length}
              </Title>
              <Text size="sm" c="dimmed">
                Low stock signals under 10 units
              </Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper radius="xl" p="lg" withBorder>
              <Group justify="space-between">
                <ThemeIcon variant="gradient" gradient={{ from: "teal", to: "brand.5" }} size="xl" radius="lg">
                  <IconTrendingUp size={22} />
                </ThemeIcon>
                <Text size="xs" c="dimmed">
                  Protected batches
                </Text>
              </Group>
              <Title order={3} mt="sm">
                {alerts.length}
              </Title>
              <Text size="sm" c="dimmed">
                Items nearing expiry with markdowns
              </Text>
            </Paper>
          </Grid.Col>
        </Grid>
      </Card>

      {alerts.length > 0 && (
        <Alert icon={<IconAlertTriangle size={16} />} color="orange" radius="lg">
          {alerts.length} items nearing expiry. Review smart discounts and clearance plans.
        </Alert>
      )}

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card radius="xl" p="xl" withBorder>
            <Title order={4}>Upload inventory workbook</Title>
            <Text size="sm" c="dimmed" mt="xs">
              Accepts .xlsx or .xls with columns SKU, Name, Description, Category, BasePrice, Quantity, ExpiryDate.
            </Text>
            <Box
              component="label"
              mt="lg"
              style={{
                border: "1.5px dashed rgba(67, 97, 238, 0.45)",
                borderRadius: 20,
                padding: "2.4rem 1.6rem",
                textAlign: "center",
                cursor: "pointer",
                background: "rgba(73, 92, 249, 0.05)"
              }}
            >
              <ThemeIcon
                size={48}
                radius="xl"
                variant="gradient"
                gradient={{ from: "brand.4", to: "brand.7" }}
                style={{ marginBottom: "1rem" }}
              >
                <IconCloudUpload size={26} />
              </ThemeIcon>
              <Text fw={600}>Drag & drop or click to upload</Text>
              <Text size="sm" c="dimmed">
                {uploading ? "Processing workbook..." : "Max 5MB Excel files"}
              </Text>
              <input type="file" hidden accept=".xlsx,.xls" onChange={handleInventoryUpload} />
            </Box>
            <Group gap="sm" mt="lg">
              <Badge color="brand" variant="light" radius="sm" size="sm">
                Auto-prices near-expiry SKUs
              </Badge>
              <Badge color="teal" variant="light" radius="sm" size="sm">
                Syncs with demand forecasts
              </Badge>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card radius="xl" p="xl" withBorder>
            <Title order={4}>Expiry alerts</Title>
            <Stack gap="sm" mt="lg">
              {alerts.slice(0, 6).map((item: InventoryItem) => (
                <Group key={item.id} justify="space-between" align="center" style={{ borderBottom: "1px solid rgba(67,97,238,0.08)", paddingBottom: 8 }}>
                  <div>
                    <Text fw={500}>{item.product.name}</Text>
                    {item.expiryDate && (
                      <Text size="xs" c="dimmed">
                        Expires {new Date(item.expiryDate).toLocaleDateString()}
                      </Text>
                    )}
                  </div>
                  <Badge color="orange" variant="light">
                    {item.status}
                  </Badge>
                </Group>
              ))}
              {alerts.length === 0 && <Text size="sm">No expiry risks detected.</Text>}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

          <Card radius="xl" p="xl" withBorder>
        <Title order={4} mb="md">
          SKU performance snapshot
        </Title>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Product</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th ta="right">Qty</Table.Th>
              <Table.Th ta="right">Dynamic Price</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {inventory.map((item: InventoryItem) => (
              <Table.Tr key={item.id}>
                <Table.Td>{item.product.name}</Table.Td>
                <Table.Td>
                  <Badge color={item.status === "AVAILABLE" ? "teal" : item.status === "LOW_STOCK" ? "orange" : "red"}>
                    {item.status}
                  </Badge>
                </Table.Td>
                <Table.Td ta="right">{item.quantity}</Table.Td>
                <Table.Td ta="right">₹{item.dynamicPrice.toFixed(2)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
}
