import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Modal,
  NativeSelect,
  NumberInput,
  Paper,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title
} from "@mantine/core";
import { IconShoppingCart, IconAlertCircle, IconTag } from "@tabler/icons-react";

import { fetchStoreProducts } from "../api/store";
import { createOrder } from "../api/order";
import type { InventoryItem } from "../types";
import { useAuthStore, type AuthState } from "../store/authStore";

export default function StoreDetailPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const user = useAuthStore((state: AuthState) => state.user);
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [address, setAddress] = useState(user?.addressLine1 ?? "");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderError, setOrderError] = useState<string | undefined>();
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!storeId) return;
    fetchStoreProducts(storeId).then(setProducts);
  }, [storeId]);

  const cartLines = useMemo(() => {
    return products
      .filter((item: InventoryItem) => cart[item.id] && cart[item.id] > 0)
      .map((item: InventoryItem) => ({
        inventoryItemId: item.id,
        quantity: cart[item.id],
        product: item.product,
        price: item.dynamicPrice,
        basePrice: item.product.basePrice,
        status: item.status
      }));
  }, [cart, products]);

  const subtotal = cartLines.reduce(
    (acc: number, line: (typeof cartLines)[number]) => acc + line.price * line.quantity,
    0
  );

  const cartCount = cartLines.reduce((acc, l) => acc + l.quantity, 0);

  const updateQuantity = (inventoryId: string, quantity: number) => {
    setCart((prev: Record<string, number>) => ({ ...prev, [inventoryId]: quantity }));
  };

  const handleCheckout = async () => {
    if (!storeId) return;
    setPlacing(true);
    setOrderError(undefined);
    try {
      await createOrder({
        storeId,
        items: cartLines.map((line: (typeof cartLines)[number]) => ({
          inventoryItemId: line.inventoryItemId,
          quantity: line.quantity
        })),
        paymentMethod,
        deliveryAddress: address,
        deliveryLatitude: 13.0604,
        deliveryLongitude: 80.2496
      });
      setCart({});
      setCheckoutOpen(false);
      setOrderPlaced(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order. Please try again.";
      setOrderError(msg);
    } finally {
      setPlacing(false);
    }
  };

  const cartItemCount = cartLines.length;

  return (
    <Stack gap="xl">
      {orderPlaced && (
        <Alert icon={<IconShoppingCart size={16} />} color="teal" radius="lg" withCloseButton onClose={() => setOrderPlaced(false)}>
          Order placed successfully! Track it in <Link to="/orders">My Orders</Link>.
        </Alert>
      )}

      <Group justify="space-between" align="center">
        <div>
          <Title order={2}>Store Catalogue</Title>
          <Text c="dimmed">Dynamic pricing with expiry-aware deals.</Text>
        </div>
        <Button
          leftSection={<IconShoppingCart size={18} />}
          onClick={() => setCheckoutOpen(true)}
          disabled={cartItemCount === 0 || !user}
          radius="md"
          size="md"
        >
          Cart ({cartCount} {cartCount === 1 ? "item" : "items"}) · ₹{subtotal.toFixed(2)}
        </Button>
      </Group>

      {!user && (
        <Alert icon={<IconAlertCircle size={16} />} color="brand" radius="lg" variant="light">
          <Link to="/login">Sign in</Link> or <Link to="/register">create an account</Link> to place orders.
        </Alert>
      )}

      {products.length === 0 ? (
        <Card withBorder radius="xl" p="xl" ta="center">
          <Text c="dimmed">No products available in this store right now.</Text>
        </Card>
      ) : (
        <Grid>
          {products.map((item: InventoryItem) => {
            const hasDiscount = item.dynamicPrice < item.product.basePrice;
            const discount = hasDiscount
              ? Math.round((1 - item.dynamicPrice / item.product.basePrice) * 100)
              : 0;

            return (
              <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card withBorder radius="lg" shadow="sm" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <Group justify="space-between" align="flex-start" mb="xs">
                    <div style={{ flex: 1 }}>
                      <Text fw={600}>{item.product.name}</Text>
                      {item.product.category && (
                        <Badge size="sm" variant="light" color="brand" mt={2}>{item.product.category}</Badge>
                      )}
                    </div>
                    {item.status === "NEAR_EXPIRY" && (
                      <Badge size="sm" color="orange" variant="filled" leftSection={<IconTag size={10} />}>
                        Sale
                      </Badge>
                    )}
                  </Group>
                  <Group align="baseline" gap="xs" mt="auto">
                    <Text size="xl" fw={700} c="brand">₹{item.dynamicPrice.toFixed(2)}</Text>
                    {hasDiscount && (
                      <Text size="sm" c="dimmed" td="line-through">₹{item.product.basePrice.toFixed(2)}</Text>
                    )}
                    {hasDiscount && (
                      <Badge size="xs" color="teal">{discount}% off</Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed" mt={4}>{item.quantity} in stock</Text>
                  <NumberInput
                    mt="md"
                    label="Quantity"
                    min={0}
                    max={item.quantity}
                    value={cart[item.id] ?? 0}
                    onChange={(value: string | number | undefined) => updateQuantity(item.id, Number(value))}
                    radius="md"
                  />
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>
      )}

      <Modal
        opened={checkoutOpen}
        title={
          <Group gap="sm">
            <ThemeIcon variant="gradient" gradient={{ from: "brand.4", to: "brand.7" }} size="md" radius="md">
              <IconShoppingCart size={16} />
            </ThemeIcon>
            <Text fw={600}>Review your order</Text>
          </Group>
        }
        onClose={() => { setCheckoutOpen(false); setOrderError(undefined); }}
        size="lg"
        radius="lg"
      >
        {user ? (
          <Stack>
            <Stack gap="xs">
              {cartLines.map((line: (typeof cartLines)[number]) => (
                <Paper key={line.inventoryItemId} withBorder radius="md" p="sm">
                  <Group justify="space-between">
                    <div>
                      <Text fw={500} size="sm">{line.product.name}</Text>
                      {line.basePrice > line.price && (
                        <Text size="xs" c="teal">
                          Saving ₹{((line.basePrice - line.price) * line.quantity).toFixed(2)}
                        </Text>
                      )}
                    </div>
                    <Text size="sm" fw={600}>
                      {line.quantity} × ₹{line.price.toFixed(2)} = ₹{(line.price * line.quantity).toFixed(2)}
                    </Text>
                  </Group>
                </Paper>
              ))}
            </Stack>
            <Divider />
            <Group justify="space-between">
              <Text c="dimmed" size="sm">Subtotal</Text>
              <Text fw={600}>₹{subtotal.toFixed(2)}</Text>
            </Group>
            <TextInput
              label="Delivery address"
              placeholder="Enter your full delivery address"
              value={address}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setAddress(event.currentTarget.value)}
              required
            />
            <NativeSelect
              label="Payment method"
              data={[
                { label: "Cash on Delivery", value: "COD" },
                { label: "Online Payment", value: "ONLINE" }
              ]}
              value={paymentMethod}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setPaymentMethod(e.currentTarget.value as "COD" | "ONLINE")}
            />
            {orderError && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" radius="md">
                {orderError}
              </Alert>
            )}
            <Button
              onClick={handleCheckout}
              disabled={cartItemCount === 0 || !address.trim()}
              loading={placing}
              fullWidth
              radius="md"
            >
              Place order · ₹{subtotal.toFixed(2)}
            </Button>
          </Stack>
        ) : (
          <Text>Please <Link to="/login">sign in</Link> as a customer to place orders.</Text>
        )}
      </Modal>
    </Stack>
  );
}

