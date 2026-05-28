import { AppShell, Badge, Burger, Group, Title, Text, Avatar, Menu, rem } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLogout, IconPackage, IconShoppingBag, IconTruckDelivery } from "@tabler/icons-react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { useAuthStore, type AuthState } from "../store/authStore";

const navItems = [
  { label: "Explore Stores", to: "/stores", icon: IconShoppingBag },
  { label: "My Orders", to: "/orders", icon: IconPackage },
  { label: "Owner Console", to: "/owner/dashboard", icon: IconShoppingBag },
  { label: "Delivery Board", to: "/delivery", icon: IconTruckDelivery }
];

export default function RootLayout() {
  const [opened, { toggle }] = useDisclosure();
  const user = useAuthStore((state: AuthState) => state.user);
  const logout = useAuthStore((state: AuthState) => state.logout);
  const location = useLocation();

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

  return (
    <AppShell
      header={{ height: 72 }}
      navbar={{ width: 280, breakpoint: "sm", collapsed: { mobile: !opened } }}
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
            background: "rgba(255, 255, 255, 0.78)",
            borderBottom: "1px solid rgba(67, 97, 238, 0.12)"
          }}
        >
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Toggle navigation" />
            <div>
              <Title order={3}>Neighbourhood Grocery</Title>
              <Text size="xs" c="dimmed">
                Smart retail network for urban communities
              </Text>
            </div>
          </Group>
          <Group>
            {user ? (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Avatar radius="xl" color="indigo">
                    {user.name.slice(0, 2).toUpperCase()}
                  </Avatar>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>{user.name}</Menu.Label>
                  <Menu.Item leftSection={<IconPackage style={{ width: rem(16), height: rem(16) }} />}>{user.role}</Menu.Item>
                  <Menu.Item
                    color="red"
                    leftSection={<IconLogout style={{ width: rem(16), height: rem(16) }} />}
                    onClick={logout}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Group gap="xs">
                <Link to="/login">Login</Link>
                <Text>/</Text>
                <Link to="/register">Register</Link>
              </Group>
            )}
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="lg" style={{ background: "rgba(255, 255, 255, 0.9)", borderRight: "none" }}>
        <Group gap="md" align="stretch" justify="flex-start" grow>
          {filteredNav.map((item) => (
            <Link key={item.to} to={item.to} style={{ textDecoration: "none" }}>
              <Group
                p="md"
                gap="md"
                bg={location.pathname.startsWith(item.to) ? "rgba(67, 97, 238, 0.1)" : "transparent"}
                style={{
                  borderRadius: 14,
                  color: "inherit",
                  border: location.pathname.startsWith(item.to)
                    ? "1px solid rgba(67, 97, 238, 0.35)"
                    : "1px solid rgba(67, 97, 238, 0.08)"
                }}
              >
                <item.icon size={20} />
                <Text fw={500}>{item.label}</Text>
                {location.pathname.startsWith(item.to) && <Badge color="brand" variant="light">Now</Badge>}
              </Group>
            </Link>
          ))}
        </Group>
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
