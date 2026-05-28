import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Modal,
  NativeSelect,
  Paper,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Title
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconBuilding,
  IconCloudUpload,
  IconPackage,
  IconPlus,
  IconShoppingCart,
  IconTrendingUp
} from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { notifications } from "@mantine/notifications";

import { createStore, fetchOwnerStores, fetchStoreAlerts, fetchStoreInventory, uploadInventory } from "../api/store";
import { fetchStoreOrders, updateOrderStatus } from "../api/order";
import type { InventoryItem, Order, Store } from "../types";
import { getApiError } from "../utils/errors";

const createStoreSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  addressLine1: z.string().min(3, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  deliveryRadiusKm: z.coerce.number().optional(),
  minOrderValue: z.coerce.number().optional()
});

type CreateStoreFormValues = z.infer<typeof createStoreSchema>;

const statusColors: Record<Order["status"], string> = {
  PENDING: "yellow",
  CONFIRMED: "blue",
  PREPARING: "cyan",
  OUT_FOR_DELIVERY: "orange",
  COMPLETED: "teal",
  CANCELLED: "red"
};

const nextStatus: Partial<Record<Order["status"], Order["status"]>> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "COMPLETED"
};

export default function OwnerDashboardPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [uploading, setUploading] = useState(false);
  const [createStoreOpen, setCreateStoreOpen] = useState(false);
  const [createStoreError, setCreateStoreError] = useState<string | undefined>();
  const [creatingStore, setCreatingStore] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateStoreFormValues>({ resolver: zodResolver(createStoreSchema) });

  const loadStores = () =>
    fetchOwnerStores()
      .then((data) => {
        setStores(data);
        if (data.length > 0 && !selectedStoreId) {
          setSelectedStoreId(data[0].id);
        }
      })
      .catch((err) => {
        notifications.show({ title: "Error", message: getApiError(err, "Failed to load your stores."), color: "red" });
      });

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedStoreId) return;
    fetchStoreInventory(selectedStoreId).then(setInventory);
    fetchStoreAlerts(selectedStoreId).then(setAlerts);
    fetchStoreOrders(selectedStoreId).then(setOrders);
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
      event.currentTarget.value = "";
      notifications.show({
        title: "Upload complete",
        message: `${summary.rowsProcessed} rows processed — ${summary.createdInventory} created, ${summary.updatedInventory} updated, ${summary.newCatalogItems} new catalog items.`,
        color: "teal",
        autoClose: 6000
      });
    } catch (err) {
      notifications.show({ title: "Upload failed", message: getApiError(err), color: "red" });
    } finally {
      setUploading(false);
    }
  };

  const handleAdvanceOrderStatus = async (orderId: string, currentStatus: Order["status"]) => {
    const next = nextStatus[currentStatus];
    if (!next) return;
    try {
      await updateOrderStatus(orderId, next);
      notifications.show({ title: "Order updated", message: `Status advanced to ${next.replace(/_/g, " ")}.`, color: "teal" });
      if (selectedStoreId) {
        fetchStoreOrders(selectedStoreId).then(setOrders);
      }
    } catch (err) {
      notifications.show({ title: "Error", message: getApiError(err), color: "red" });
    }
  };

  const onCreateStore = async (values: CreateStoreFormValues) => {
    setCreatingStore(true);
    setCreateStoreError(undefined);
    try {
      await createStore(values);
      await loadStores();
      reset();
      setCreateStoreOpen(false);
    } catch (err) {
      setCreateStoreError(getApiError(err, "Failed to create store. Please verify the details."));
    } finally {
      setCreatingStore(false);
    }
  };

  return (
    <Stack gap="xl">
      {/* Header */}
      <Card padding="xl" radius="xl" withBorder>
        <Group justify="space-between" align="center" wrap="wrap" gap="lg">
          <div>
            <Title order={2}>Owner Console</Title>
            <Text c="dimmed">Command inventory strategy, expiry mitigation, and fulfilment readiness.</Text>
          </div>
          <Group>
            {stores.length > 0 && (
              <NativeSelect
                label="Active store"
                data={stores.map((store: Store) => ({ value: store.id, label: store.name }))}
                value={selectedStoreId ?? (stores[0]?.id ?? "")}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => setSelectedStoreId(event.currentTarget.value)}
                radius="md"
              />
            )}
            <Button
              leftSection={<IconPlus size={16} />}
              variant="light"
              radius="md"
              mt="lg"
              onClick={() => setCreateStoreOpen(true)}
            >
              New Store
            </Button>
          </Group>
        </Group>

        {/* KPI Cards */}
        <Grid mt="xl" gutter="xl">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper radius="xl" p="lg" withBorder>
              <Group justify="space-between">
                <ThemeIcon variant="gradient" gradient={{ from: "brand.4", to: "brand.7" }} size="xl" radius="lg">
                  <IconPackage size={22} />
                </ThemeIcon>
                <Text size="xs" c="dimmed">Total SKUs</Text>
              </Group>
              <Title order={3} mt="sm">{inventory.length}</Title>
              <Text size="sm" c="dimmed">Active catalogue items</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper radius="xl" p="lg" withBorder>
              <Group justify="space-between">
                <ThemeIcon variant="gradient" gradient={{ from: "orange", to: "yellow" }} size="xl" radius="lg">
                  <IconAlertTriangle size={22} />
                </ThemeIcon>
                <Text size="xs" c="dimmed">Smart threshold</Text>
              </Group>
              <Title order={3} mt="sm">{lowStock.length}</Title>
              <Text size="sm" c="dimmed">Low stock under 10 units</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper radius="xl" p="lg" withBorder>
              <Group justify="space-between">
                <ThemeIcon variant="gradient" gradient={{ from: "teal", to: "brand.5" }} size="xl" radius="lg">
                  <IconTrendingUp size={22} />
                </ThemeIcon>
                <Text size="xs" c="dimmed">Protected batches</Text>
              </Group>
              <Title order={3} mt="sm">{alerts.length}</Title>
              <Text size="sm" c="dimmed">Near-expiry with markdowns</Text>
            </Paper>
          </Grid.Col>
        </Grid>
      </Card>

      {alerts.length > 0 && (
        <Alert icon={<IconAlertTriangle size={16} />} color="orange" radius="lg">
          {alerts.length} item{alerts.length !== 1 ? "s" : ""} nearing expiry. Review smart discounts and clearance plans.
        </Alert>
      )}

      {stores.length === 0 && (
        <Card radius="xl" p="xl" withBorder style={{ textAlign: "center" }}>
          <ThemeIcon size={64} radius="xl" variant="light" color="brand" style={{ margin: "0 auto 1rem" }}>
            <IconBuilding size={32} />
          </ThemeIcon>
          <Title order={3} mb="sm">No stores yet</Title>
          <Text c="dimmed" mb="lg">Create your first store to start managing inventory and fulfilling orders.</Text>
          <Button leftSection={<IconPlus size={16} />} radius="md" onClick={() => setCreateStoreOpen(true)}>
            Create your first store
          </Button>
        </Card>
      )}

      {/* Main Tabs */}
      {selectedStoreId && (
        <Tabs defaultValue="inventory" radius="lg" variant="pills">
          <Tabs.List mb="lg">
            <Tabs.Tab value="inventory" leftSection={<IconPackage size={16} />}>Inventory</Tabs.Tab>
            <Tabs.Tab value="orders" leftSection={<IconShoppingCart size={16} />}>
              Orders
              {orders.filter((o) => o.status === "PENDING" || o.status === "CONFIRMED").length > 0 && (
                <Badge size="xs" color="red" variant="filled" ml="xs">
                  {orders.filter((o) => o.status === "PENDING" || o.status === "CONFIRMED").length}
                </Badge>
              )}
            </Tabs.Tab>
            <Tabs.Tab value="expiry" leftSection={<IconAlertTriangle size={16} />}>Expiry Alerts</Tabs.Tab>
          </Tabs.List>

          {/* Inventory Tab */}
          <Tabs.Panel value="inventory">
            <Grid gutter="xl">
              <Grid.Col span={{ base: 12, md: 5 }}>
                <Card radius="xl" p="xl" withBorder>
                  <Title order={4}>Upload inventory workbook</Title>
                  <Text size="sm" c="dimmed" mt="xs">
                    Accepts .xlsx or .xls with columns: SKU, Name, Description, Category, BasePrice, Quantity, ExpiryDate.
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
                      background: "rgba(73, 92, 249, 0.05)",
                      display: "block"
                    }}
                  >
                    <ThemeIcon
                      size={48}
                      radius="xl"
                      variant="gradient"
                      gradient={{ from: "brand.4", to: "brand.7" }}
                      style={{ marginBottom: "1rem", marginLeft: "auto", marginRight: "auto" }}
                    >
                      <IconCloudUpload size={26} />
                    </ThemeIcon>
                    <Text fw={600}>Drag & drop or click to upload</Text>
                    <Text size="sm" c="dimmed">
                      {uploading ? "Processing workbook..." : "Max 5 MB Excel files"}
                    </Text>
                    <input type="file" hidden accept=".xlsx,.xls" onChange={handleInventoryUpload} />
                  </Box>
                  <Group gap="sm" mt="lg">
                    <Badge color="brand" variant="light" radius="sm" size="sm">Auto-prices near-expiry SKUs</Badge>
                    <Badge color="teal" variant="light" radius="sm" size="sm">Syncs with demand forecasts</Badge>
                  </Group>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Card radius="xl" p="xl" withBorder>
                  <Title order={4} mb="md">SKU performance snapshot</Title>
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
                      {inventory.length === 0 && (
                        <Table.Tr>
                          <Table.Td colSpan={4}>
                            <Text size="sm" c="dimmed" ta="center" py="lg">
                              No inventory yet. Upload a workbook to get started.
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      )}
                      {inventory.map((item: InventoryItem) => (
                        <Table.Tr key={item.id}>
                          <Table.Td>{item.product.name}</Table.Td>
                          <Table.Td>
                            <Badge
                              color={
                                item.status === "AVAILABLE"
                                  ? "teal"
                                  : item.status === "LOW_STOCK"
                                  ? "orange"
                                  : "red"
                              }
                            >
                              {item.status.replace(/_/g, " ")}
                            </Badge>
                          </Table.Td>
                          <Table.Td ta="right">{item.quantity}</Table.Td>
                          <Table.Td ta="right">₹{item.dynamicPrice.toFixed(2)}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Card>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          {/* Orders Tab */}
          <Tabs.Panel value="orders">
            <Card radius="xl" p="xl" withBorder>
              <Title order={4} mb="md">Store Orders</Title>
              {orders.length === 0 ? (
                <Text size="sm" c="dimmed">No orders yet.</Text>
              ) : (
                <Stack gap="md">
                  {orders.map((order: Order) => (
                    <Paper key={order.id} withBorder radius="lg" p="lg">
                      <Group justify="space-between" align="flex-start" wrap="wrap">
                        <div>
                          <Text fw={600}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
                          <Text size="xs" c="dimmed">{new Date(order.createdAt).toLocaleString()}</Text>
                          <Text size="sm" mt="xs">Deliver to: {order.deliveryAddress}</Text>
                        </div>
                        <Group gap="sm" align="center">
                          <Badge color={statusColors[order.status]}>{order.status.replace(/_/g, " ")}</Badge>
                          <Text fw={600}>₹{order.total.toFixed(2)}</Text>
                        </Group>
                      </Group>
                      <Divider my="sm" />
                      <Group justify="space-between" align="flex-start" wrap="wrap">
                        <Stack gap={4}>
                          {order.items.map((item) => (
                            <Text key={item.id} size="sm">
                              {item.product.name} × {item.quantity} — ₹{item.finalPrice.toFixed(2)}
                            </Text>
                          ))}
                        </Stack>
                        {nextStatus[order.status] && (
                          <Button
                            size="xs"
                            variant="light"
                            radius="md"
                            onClick={() => handleAdvanceOrderStatus(order.id, order.status)}
                          >
                            Mark as {nextStatus[order.status]?.replace(/_/g, " ")}
                          </Button>
                        )}
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Card>
          </Tabs.Panel>

          {/* Expiry Alerts Tab */}
          <Tabs.Panel value="expiry">
            <Card radius="xl" p="xl" withBorder>
              <Title order={4} mb="md">Expiry alerts &amp; smart discounts</Title>
              {alerts.length === 0 ? (
                <Text size="sm" c="dimmed">No expiry risks detected. All batches are within safe thresholds.</Text>
              ) : (
                <Stack gap="sm">
                  {alerts.map((item: InventoryItem) => (
                    <Paper key={item.id} withBorder radius="lg" p="md">
                      <Group justify="space-between" align="center">
                        <div>
                          <Text fw={500}>{item.product.name}</Text>
                          {item.expiryDate && (
                            <Text size="xs" c="dimmed">
                              Expires {new Date(item.expiryDate).toLocaleDateString()}
                            </Text>
                          )}
                          <Text size="xs" c="dimmed">
                            Base ₹{item.product.basePrice.toFixed(2)} → Dynamic ₹{item.dynamicPrice.toFixed(2)}
                          </Text>
                        </div>
                        <Group gap="sm">
                          <Badge color="orange" variant="light">{item.status.replace(/_/g, " ")}</Badge>
                          <Badge color="teal" variant="light">{item.quantity} left</Badge>
                        </Group>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Card>
          </Tabs.Panel>
        </Tabs>
      )}

      {/* Create Store Modal */}
      <Modal
        opened={createStoreOpen}
        onClose={() => {
          setCreateStoreOpen(false);
          reset();
          setCreateStoreError(undefined);
        }}
        title={
          <Group gap="sm">
            <ThemeIcon variant="gradient" gradient={{ from: "brand.4", to: "brand.7" }} size="md" radius="md">
              <IconBuilding size={16} />
            </ThemeIcon>
            <Text fw={600}>Open a new store</Text>
          </Group>
        }
        size="lg"
        radius="lg"
      >
        <form onSubmit={handleSubmit(onCreateStore)}>
          <Stack gap="md">
            <TextInput label="Store name" placeholder="e.g. Sharma Provisions" {...register("name")} error={errors.name?.message} />
            <TextInput label="Description" placeholder="Briefly describe your store (optional)" {...register("description")} />
            <TextInput label="Address line 1" placeholder="Street address" {...register("addressLine1")} error={errors.addressLine1?.message} />
            <TextInput label="Address line 2" placeholder="Apartment, suite, etc. (optional)" {...register("addressLine2")} />
            <Grid>
              <Grid.Col span={6}>
                <TextInput label="City" placeholder="e.g. Chennai" {...register("city")} error={errors.city?.message} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="State" placeholder="e.g. Tamil Nadu" {...register("state")} error={errors.state?.message} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Postal code" placeholder="e.g. 600001" {...register("postalCode")} error={errors.postalCode?.message} />
              </Grid.Col>
            </Grid>
            <Grid>
              <Grid.Col span={6}>
                <TextInput label="Latitude" placeholder="e.g. 13.0604" {...register("latitude")} error={errors.latitude?.message} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Longitude" placeholder="e.g. 80.2496" {...register("longitude")} error={errors.longitude?.message} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Delivery radius (km)" placeholder="Default: 8" {...register("deliveryRadiusKm")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Min. order value (₹)" placeholder="Default: 200" {...register("minOrderValue")} />
              </Grid.Col>
            </Grid>
            {createStoreError && <Text c="red" size="sm">{createStoreError}</Text>}
            <Button type="submit" loading={creatingStore} fullWidth radius="md">
              Create store
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}

