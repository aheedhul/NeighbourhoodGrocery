import { AppShell, Badge, Box, Burger, Button, Group, Stack, Text, Avatar, Menu, rem, Title, NavLink } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLogout, IconPackage, IconShoppingBag, IconTruckDelivery, IconDashboard } from "@tabler/icons-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuthStore, type AuthState } from "../store/authStore";

const navItems = [
  { label: "Explore Stores", to: "/stores", icon: IconShoppingBag },
  { label: "My Orders", to: "/orders", icon: IconPackage },
  { label: "Owner Console", to: "/owner/dashboard", icon: IconDashboard },
  { label: "Delivery Board", to: "/delivery", icon: IconTruckDelivery }
];

export default function RootLayout() {
  const [opened, { toggle, close }] = useDisclosure();
  const user = useAuthStore((state: AuthState) => state.user);
  const logout = useAuthStore((state: AuthState) => state.logout);
  const location = useLocation();
  const navigate = useNavigate();

  const filteredNav = navItems.filter((item) => {
    if (item.to.startsWith("/owner") && user?.role !== "OWNER" && user?.role !== "ADMIN") {
      return false;
    }
    if (item.to === "/delivery" && user?.role !== "DELIVERY" && user?.role !== "ADMIN") {
      return false;
    }
    if (item.to === "/orders" && user?.role !== "CUSTOMER") {
      return false;
    }
    return true;
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <AppShell
      header={{ height: 72 }}
      navbar={{ width: 260, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="xl"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(105, 118, 255, 0.22) 0%, transparent 45%), radial-gradient(circle at bottom right, rgba(74, 222, 255, 0.22) 0%, transparent 55%), #f7f8ff"
      }}
    >
      <AppShell.Header>
        <Group
          h="100%"
          px="lg"
          justify="space-between"
          style={{
            backdropFilter: "blur(18px)",
            background: "rgba(255, 255, 255, 0.85)",
            borderBottom: "1px solid rgba(67, 97, 238, 0.12)"
          }}
        >
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Toggle navigation" />
            <Box component={Link} to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <Title order={3} style={{ lineHeight: 1.1 }}>Neighbourhood Grocery</Title>
              <Text size="xs" c="dimmed">Smart retail network for urban communities</Text>
            </Box>
          </Group>
          <Group>
            {user ? (
              <Menu shadow="lg" width={220} radius="lg">
                <Menu.Target>
                  <Box style={{ cursor: "pointer" }}>
                    <Group gap="sm">
                      <Avatar radius="xl" color="indigo" size="md">
                        {user.name.slice(0, 2).toUpperCase()}
                      </Avatar>
                      <Box visibleFrom="sm">
                        <Text size="sm" fw={600} lh={1.2}>{user.name}</Text>
                        <Badge size="xs" color="brand" variant="light">{user.role}</Badge>
                      </Box>
                    </Group>
                  </Box>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Signed in as {user.role}</Menu.Label>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconLogout style={{ width: rem(16), height: rem(16) }} />}
                    onClick={handleLogout}
                  >
                    Sign out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Group gap="xs">
                <Button component={Link} to="/login" variant="subtle" size="sm" radius="md">
                  Sign in
                </Button>
                <Button component={Link} to="/register" size="sm" radius="md">
                  Get started
                </Button>
              </Group>
            )}
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md" style={{ background: "rgba(255, 255, 255, 0.92)", borderRight: "1px solid rgba(67, 97, 238, 0.10)" }}>
        <Stack gap="xs">
          {filteredNav.map((item) => (
            <NavLink
              key={item.to}
              component={Link}
              to={item.to}
              label={item.label}
              leftSection={<item.icon size={18} />}
              active={location.pathname.startsWith(item.to)}
              onClick={close}
              style={{ fontWeight: 500, borderRadius: 8 }}
            />
          ))}
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

