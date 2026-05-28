import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Title
} from "@mantine/core";

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
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    if (!storeId) return;
    fetchStoreProducts(storeId).then(setProducts);
  }, [storeId]);

  const cartLines = useMemo(() => {
    return products
      .filter((item: InventoryItem) => cart[item.id])
      .map((item: InventoryItem) => ({
        inventoryItemId: item.id,
        quantity: cart[item.id],
        product: item.product,
        price: item.dynamicPrice
      }));
  }, [cart, products]);

  const subtotal = cartLines.reduce(
    (acc: number, line: (typeof cartLines)[number]) => acc + line.price * line.quantity,
    0
  );

  const updateQuantity = (inventoryId: string, quantity: number) => {
    setCart((prev: Record<string, number>) => ({ ...prev, [inventoryId]: quantity }));
  };

  const handleCheckout = async () => {
    if (!storeId) return;
    await createOrder({
      storeId,
      items: cartLines.map((line: (typeof cartLines)[number]) => ({
        inventoryItemId: line.inventoryItemId,
        quantity: line.quantity
      })),
      paymentMethod: "COD",
      deliveryAddress: address,
      deliveryLatitude: 13.0604,
      deliveryLongitude: 80.2496
    });
    setCart({});
    setCheckoutOpen(false);
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center">
        <div>
          <Title order={2}>Store Catalogue</Title>
          <Text c="dimmed">Dynamic pricing with expiry-aware deals.</Text>
        </div>
        <Button onClick={() => setCheckoutOpen(true)} disabled={cartLines.length === 0 || !user}>
          Checkout ({subtotal.toFixed(2)})
        </Button>
      </Group>
      <Grid>
        {products.map((item: InventoryItem) => (
          <Grid.Col key={item.id} span={{ base: 12, md: 6, lg: 4 }}>
            <Card withBorder radius="md" shadow="sm">
              <Title order={4}>{item.product.name}</Title>
              {item.product.category && (
                <Text size="sm" c="dimmed">
                  {item.product.category}
                </Text>
              )}
              <Text size="lg" fw={600} mt="sm">
                ₹{item.dynamicPrice.toFixed(2)}
              </Text>
              <Text size="xs" c="dimmed">
                Stock: {item.quantity}
              </Text>
              <NumberInput
                mt="md"
                label="Quantity"
                min={0}
                max={item.quantity}
                value={cart[item.id] ?? 0}
                onChange={(value: string | number | undefined) => updateQuantity(item.id, Number(value))}
              />
            </Card>
          </Grid.Col>
        ))}
      </Grid>
      <Modal opened={checkoutOpen} title="Confirm order" onClose={() => setCheckoutOpen(false)} size="lg">
        {user ? (
          <Stack>
            <Text size="sm">Review your basket and confirm delivery address.</Text>
            {cartLines.map((line: (typeof cartLines)[number]) => (
              <Group key={line.inventoryItemId} justify="space-between">
                <Text>{line.product.name}</Text>
                <Text>
                  {line.quantity} × ₹{line.price.toFixed(2)}
                </Text>
              </Group>
            ))}
            <Divider />
            <TextInput
              label="Delivery address"
              value={address}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setAddress(event.currentTarget.value)}
            />
            <Group justify="space-between">
              <Text fw={600}>Subtotal: ₹{subtotal.toFixed(2)}</Text>
              <Button onClick={handleCheckout} disabled={cartLines.length === 0}>
                Place order
              </Button>
            </Group>
          </Stack>
        ) : (
          <Text>Please log in as a customer to place orders.</Text>
        )}
      </Modal>
    </Stack>
  );
}
