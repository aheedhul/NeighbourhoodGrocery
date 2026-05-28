import { Badge, Box, Button, Card, Grid, Group, Image, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconChartDots3, IconSparkles, IconWorldPin, IconTruckDelivery } from "@tabler/icons-react";
import { Link } from "react-router-dom";

const highlights = [
  {
    icon: IconSparkles,
    title: "AI-first merchandising",
    description: "Personalized recommendations shift average basket value by 18%."
  },
  {
    icon: IconChartDots3,
    title: "Demand signals",
    description: "Short-term forecasts update every 30 minutes based on live orders."
  },
  {
    icon: IconTruckDelivery,
    title: "Hyperlocal logistics",
    description: "Delivery SLA monitoring keeps riders on track and customers informed."
  }
];

const stats = [
  { label: "Dynamic SKUs", value: "1.2k" },
  { label: "Expiry savings", value: "32%" },
  { label: "Promise accuracy", value: "97%" }
];

export default function LandingPage() {
  return (
    <Stack gap="xl">
      <Card
        padding="xl"
        radius="xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(76, 110, 245, 0.95) 0%, rgba(53, 63, 221, 0.92) 52%, rgba(39, 206, 255, 0.85) 100%)",
          color: "#ffffff"
        }}
      >
        <Grid align="center" gutter={40}>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Badge color="brand" variant="light" size="lg" radius="sm" mb="lg" style={{ color: "#16213c" }}>
              Rethinking neighbourhood grocery intelligence
            </Badge>
            <Title order={1} mb="md" style={{ color: "#ffffff" }}>
              A retail command center for ambitious neighbourhood stores
            </Title>
            <Text size="lg" mb="xl" style={{ color: "rgba(255, 255, 255, 0.86)" }}>
              Manage merchandising, elastic pricing, and last-mile delivery from one modern cockpit designed for owners,
              runners, and loyal customers.
            </Text>
            <Group gap="md">
              <Button component={Link} to="/stores" size="lg" radius="md" color="dark">
                Explore Stores
              </Button>
              <Button component={Link} to="/owner/dashboard" size="lg" variant="white" radius="md" color="dark">
                Launch Owner Console
              </Button>
            </Group>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card
              radius="lg"
              padding="lg"
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                backdropFilter: "blur(16px)"
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=960&q=80"
                radius="md"
                alt="Modern neighbourhood grocery"
              />
              <Group mt="lg" gap="lg" wrap="nowrap">
                {stats.map((item) => (
                  <div key={item.label}>
                    <Text fw={700} size="xl">
                      {item.value}
                    </Text>
                    <Text size="xs" c="rgba(255,255,255,0.7)">
                      {item.label}
                    </Text>
                  </div>
                ))}
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
      </Card>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        {highlights.map((item) => (
          <Card key={item.title} padding="xl" radius="lg" withBorder>
            <ThemeIcon size="lg" radius="md" variant="light" color="brand" mb="md">
              <item.icon size={20} />
            </ThemeIcon>
            <Title order={4} mb="sm">
              {item.title}
            </Title>
            <Text size="sm" c="dimmed">
              {item.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Card radius="xl" padding="xl" withBorder>
        <Grid align="center">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Title order={2}>Built for the neighbourhood economy</Title>
            <Text size="md" c="dimmed" mt="sm">
              Owners orchestrate replenishment and pricing, customers get delightful discovery, and delivery runners stay on
              track with clear SLAs.
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Box
              style={{
                borderRadius: 18,
                padding: "1.2rem",
                background: "linear-gradient(135deg, rgba(74, 222, 255, 0.15), rgba(99, 102, 241, 0.15))"
              }}
            >
              <Group gap="md">
                <ThemeIcon variant="gradient" gradient={{ from: "brand.4", to: "brand.7" }} size="xl" radius="md">
                  <IconWorldPin size={22} />
                </ThemeIcon>
                <div>
                  <Text fw={600}>Hyperlocal insights</Text>
                  <Text size="sm" c="dimmed">
                    Real-time density maps align rider placement with demand surges at neighbourhood level.
                  </Text>
                </div>
              </Group>
            </Box>
          </Grid.Col>
        </Grid>
      </Card>
    </Stack>
  );
}
