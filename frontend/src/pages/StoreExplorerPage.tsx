import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Loader,
  NumberInput,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Title
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import { fetchNearbyStores } from "../api/store";
import { fetchPersonalizedRecommendations } from "../api/recommendation";
import type { StoreSummary, Recommendation } from "../types";
import { useAuthStore, type AuthState } from "../store/authStore";
import { getApiError } from "../utils/errors";

export default function StoreExplorerPage() {
  const user = useAuthStore((state: AuthState) => state.user);
  const [latitude, setLatitude] = useState(13.0604);
  const [longitude, setLongitude] = useState(80.2496);
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadStores = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const storeList = await fetchNearbyStores(latitude, longitude, 10);
      setStores(storeList);
      if (user?.role === "CUSTOMER") {
        try {
          const recs = await fetchPersonalizedRecommendations();
          setRecommendations(recs);
        } catch {
          // recommendations are non-critical — fail silently
        }
      }
    } catch (err) {
      setFetchError(getApiError(err, "Could not load stores. Check your connection and try again."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack gap="xl">
      <Card padding="xl" radius="xl" withBorder>
        <Group justify="space-between" align="center" wrap="wrap">
          <div>
            <Title order={2}>Find your neighbourhood anchor stores</Title>
            <Text c="dimmed">
              Calibrated search parameters pinpoint the best inventory depth and fastest delivery promises around you.
            </Text>
          </div>
          <Group>
            <NumberInput
              label="Latitude"
              value={latitude}
              onChange={(value: string | number | undefined) => setLatitude(Number(value))}
              step={0.0005}
            />
            <NumberInput
              label="Longitude"
              value={longitude}
              onChange={(value: string | number | undefined) => setLongitude(Number(value))}
              step={0.0005}
            />
            <Button onClick={loadStores} disabled={loading} radius="md">
              Refresh
            </Button>
          </Group>
        </Group>
      </Card>

      {fetchError && (
        <Alert icon={<IconAlertCircle />} color="red" radius="xl" title="Could not load stores" withCloseButton onClose={() => setFetchError(null)}>
          {fetchError}
        </Alert>
      )}

      {loading ? (
        <Group justify="center">
          <Loader />
        </Group>
      ) : (
        <Grid gutter="xl">
          {stores.map((store: StoreSummary) => (
            <Grid.Col key={store.id} span={{ base: 12, md: 6, lg: 4 }}>
              <Card radius="lg" padding="xl" withBorder>
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Title order={4}>{store.name}</Title>
                    <Text c="dimmed" size="sm">
                      {store.city}, {store.state}
                    </Text>
                  </div>
                  <Badge color="brand" variant="light">
                    {store.distanceKm} km away
                  </Badge>
                </Group>
                <Text size="sm" mt="md">
                  Minimum order value ₹{store.minOrderValue}
                </Text>
                <Progress
                  mt="lg"
                  radius="xl"
                  color="brand.5"
                  value={Math.max(10, Math.min(90, 100 - store.distanceKm * 4))}
                />
                <Button mt="xl" fullWidth radius="md" onClick={() => navigate(`/stores/${store.id}`)}>
                  View catalogue
                </Button>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}

      {user?.role === "CUSTOMER" && recommendations.length > 0 && (
        <Stack gap="lg">
          <Title order={3}>Recommended For You</Title>
          <Grid gutter="lg">
            {recommendations.map((rec: Recommendation) => (
              <Grid.Col key={rec.inventoryId} span={{ base: 12, md: 6, lg: 4 }}>
                <Card radius="lg" padding="lg" withBorder>
                  <Group justify="space-between" align="center" mb="sm">
                    <Title order={5}>{rec.name}</Title>
                    <ThemeIcon size="sm" radius="md" variant="gradient" gradient={{ from: "brand.5", to: "brand.7" }}>
                      ⭐
                    </ThemeIcon>
                  </Group>
                  {rec.category && (
                    <Text size="sm" c="dimmed">
                      {rec.category}
                    </Text>
                  )}
                  <Text size="sm" mt="md">
                    ₹{rec.dynamicPrice.toFixed(2)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Match score {rec.score}
                  </Text>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      )}
    </Stack>
  );
}
